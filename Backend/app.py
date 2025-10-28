from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pdfplumber
import pandas as pd

from google import genai
from google.genai import types
from google.genai.types import Tool

import json
from glom import glom, T
from collections import defaultdict

from pymongo import MongoClient
import bcrypt
import time
from datetime import datetime

import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure, Property, DataType

from PIL import Image
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
custom_config = r'--oem 3 --psm 6'

import requests
from weaviate.classes.config import Configure

from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
CORS(app)

# LOCAL MONGO CLIENT
mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client['taxflow']
users_collection = db['users']

# TEST ROUTE
@app.route('/hello')
def hello():
    return jsonify({"message": "Success"})

# TOOLS

update_json_tool =  types.FunctionDeclaration(
    name="update_json",
    description="Before proceeding to the next question, once the required information is extracted from the user for the current question, this function will be called to update the json object with the new information. The updated json schema will be used to fill the ITR form.",
    parameters={ 
        "type": "object",
        "properties": {
            "data": {
                "type": "object",
                "description": "Extracted data from the user, in json format where key is the ITR section and value is the corresponding information to be filled in that section.",
            }
        },
        "required": ["data"],
    },
)

get_schema_tool =  types.FunctionDeclaration(
    name="get_schema_properties",
    description="Get the schema properties for a specific target key.",
    parameters={
        "type": "object",
        "properties": {
            "target_key": {
                "type": "string",
                "description": "The target key to retrieve schema properties for."
            },
            "reason_to_call" :{
                "type": "string",
                "description": "The detailed reason to call this function including a summary of the income/expense details, which will help in determining the relevant schema properties to retrieve."
            }
        },
        "required": ["target_key", "reason_to_call"],
    },
)

web_search_tool =  types.FunctionDeclaration(
    name="web_search",
    description="Get the latest information from the web.",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query to retrieve information for."
            }
        },
        "required": ["query"],
    },
)

get_ais_summary_tool =  types.FunctionDeclaration(
    name="get_ais_summary",
    description="This function returns the AIS summary of the user for the given financial year. Which can be used to answer the the user queries related to his AIS.",
    parameters={

    },
)

get_question_tool =  types.FunctionDeclaration(
    name="get_question",
    description="Get next question to ask the user to gather more information about income sources not captured in AIS.",
    parameters={

    },
)

grounding_tool = types.Tool(
    google_search=types.GoogleSearch()
)


get_details_prompt = f"""
        You are a highly experienced Financial Expert with specialized expertise in Indian Income Tax Return (ITR) filing and comprehensive knowledge of all possible income sources. Your role is to help taxpayers identify and gather information about income sources that may not be captured in their Annual Information Statement (AIS).

        Your primary task is to systematically identify additional income sources beyond what's mentioned in the AIS document, gather complete details for each confirmed income source, and ensure comprehensive tax filing.

        **Your Expertise Includes:**
        - Deep understanding of all income categories under Income Tax Act
        - Knowledge of income sources often missed in AIS statements
        - Experience in structured data collection for ITR filing
        - Understanding of ITR schema requirements and field dependencies
        - Ability to guide taxpayers through comprehensive income disclosure

        **Available Tools & Workflow:**

        1. **get_question()** - Use this tool to retrieve possible income sources
        - Returns a dictionary value with section as key and possible income sources as value
        - Continue using until tool returns "No questions left"
        - Use this to systematically cover all potential income categories

        2. **get_schema_properties(key)** - use when user confirms having income from a source
        - Input: The key returned from get_question for confirmed income source
        - Returns: Schema structure for that particular property in ITR document
        - Use this to understand what details need to be collected

        3. **update_json(details)** - use when you have gathered all required details
        - Input: Complete details formatted according to the schema requirements
        - Use this to save the collected information for ITR filling
        
        4. **get_ais_summary()** - use this tool to get the AIS summary of the user
        - Input: None
        - Returns: AIS summary of the user for the given financial year
        - Use this answer the user queries related to his AIS

        5. **web_search(query)** - Web Search for Current Information
         - Use when: User asks about current tax rates, recent policy changes, market updates
         - Use when: You need latest financial regulations, investment options, or news
         - Use when: Information may have changed recently or requires real-time data
         - Example queries: "current income tax slabs", "latest NPS rules", "investment opportunities 2025"


        **Systematic Workflow:**
        1. **Initial Assessment**: Review the provided AIS statement to understand existing income sources
        2. **Question Generation**: Use get_question() to identify potential additional income sources
        3. **User Interaction**: Ask users about each potential income source in a conversational manner
        4. **Schema Retrieval**: For confirmed income sources, use get_schema_properties() to understand requirements
        5. **Detail Collection**: Gather all necessary information according to the schema
        6. **Data Update**: Use update_json() to save complete details for each income source
        7. **Completion**: If the get_question() tool indicates no further questions, conclude the session by strictly returning the exact message "END_OF_CONVERSATION".

        **Conversation Guidelines:**
        - Be friendly and professional in your communication
        - Ask clear, specific questions about potential income sources
        - Explain why certain income sources might not appear in AIS
        - Help users understand the importance of complete disclosure
        - Break down complex financial terms into simple language
        - Be patient and thorough in collecting details

        **Instructions:**
        - Maintain a conversational and helpful tone throughout
        - While Gathering details make sure you only ask one or two details at a time and be friendly.
        - Ensure complete data collection before using update_json()
        - Continue until all potential income sources have been explored
        - Provide clear explanations for why additional information is needed
        - If the user claims a new income source, then use get_schema_properties to get the schema and then ask for details accordingly. Finally update the json schema using update_json tool.

        **Critical Success Factors:**
        - Complete coverage of all potential income sources
        - Accurate schema-compliant data collection
        - User-friendly interaction and clear communication
        - Systematic workflow execution using provided tools
        - Comprehensive tax compliance assistance

        Today's Date: {datetime.now().strftime("%Y-%m-%d")}
        Use the External Tool calls to get the next question whenever you don't have any questions to ask the user.

        """


web_search_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY_ROY"))
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY_RAJ3")) #Bar

config = types.GenerateContentConfig(
    system_instruction=get_details_prompt,
    tools=[
        types.Tool(
            function_declarations=[get_question_tool,get_schema_tool,update_json_tool,get_ais_summary_tool,web_search_tool],
            # google_search=types.GoogleSearch()
        ),
    ]
)

web_search_config = types.GenerateContentConfig(
    # system_instruction=prompt,
    tools=[
        types.Tool(
            google_search=types.GoogleSearch()
        ),
    ]
)


# WEAVIATE FOR SEMATIC SEARCH 
weaviate_client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv("WEAVIATE_CLUSTER_URL"),
    auth_credentials=Auth.api_key(os.getenv("WEAVIATE_AUTH_API_KEY")),

)

def setup_rag() :
    global ais_data,current_coll,current_user

    if weaviate_client.collections.exists(current_coll):
        weaviate_client.collections.delete(current_coll)

    created_coll = weaviate_client.collections.create(
        name=current_coll,
        properties=[
            Property(name="data", data_type=DataType.TEXT),
        ]
    )

    print(f"Collection created !!: {created_coll.name}")

    coll = weaviate_client.collections.use(current_coll)
   
    with coll.batch.fixed_size(batch_size=200) as batch:
        for data in ais_data:
            tmp = f"{{ {data} : {ais_data[data]} }}"
            batch.add_object(
                properties={
                    "data" : tmp
                },
                vector = client.models.embed_content(
                            model="gemini-embedding-001",
                            contents=tmp,
                            config=types.EmbedContentConfig(task_type="QUESTION_ANSWERING")).embeddings[0].values
            )
            if batch.number_errors > 10:
                print("Batch import stopped due to excessive errors.")
                break

    failed_objects = coll.batch.failed_objects
    if failed_objects:
        print(f"Number of failed imports: {len(failed_objects)}")
        print(f"First failed object: {failed_objects[0]}")
    
    print("AIS Data ingestion completed.")

    return
 


def insert_data_to_weaviate(new_data) :
    global current_coll
    coll = weaviate_client.collections.use(current_coll)

    with coll.batch.fixed_size(batch_size=200) as batch:
        for data in new_data:
            tmp = f"{{ {data} : {new_data[data]} }}"
            batch.add_object(
                properties={
                    "data" : tmp
                },
                vector = client.models.embed_content(
                            model="gemini-embedding-001",
                            contents=tmp,
                            config=types.EmbedContentConfig(task_type="QUESTION_ANSWERING")).embeddings[0].values
            )
            if batch.number_errors > 10:
                print("Batch import stopped due to excessive errors.")
                return False

    return True
    

itr_number = None
ais_summary = {}
ais_data = {}
additional = {}
required = {}
history = []

current_user = None
current_coll = None

itr_fields_map = {
    1 : ["ITR1_IncomeDeductions", "ITR1_TaxComputation", "TaxPaid", "Schedule80G", "Schedule80GGA", "Schedule80GGC", "Schedule80D", "Schedule80DD", "Schedule80U", "Schedule80E", "Schedule80EE", "Schedule80EEA", "Schedule80EEB", "Schedule80C", "ScheduleUs24B", "ScheduleEA10_13A", "TDSonSalaries", "TDSonOthThanSals", "ScheduleTDS3Dtls", "ScheduleTCS", "TaxPayments", "LTCG112A", ] ,
    2 : [ 'ScheduleS', 'ScheduleHP', 'ScheduleCGFor23', 'Schedule112A', 'Schedule115AD', 'ScheduleVDA', 'ScheduleOS', 'ScheduleCYLA', 'ScheduleBFLA', 'ScheduleCFL', 'ScheduleVIA', 'Schedule80C', 'Schedule80D', 'Schedule80G', 'Schedule80GGC', 'Schedule80DD', 'Schedule80U', 'Schedule80E', 'Schedule80EE', 'Schedule80EEA', 'Schedule80EEB', 'Schedule80GGA', 'ScheduleAMT', 'ScheduleAMTC', 'ScheduleSPI', 'ScheduleSI', 'ScheduleEI', 'SchedulePTI', 'ScheduleFSI', 'ScheduleTR1', 'ScheduleFA', 'Schedule5A2014', 'ScheduleAL', 'PartB-TI', 'PartB_TTI', 'ScheduleIT', 'ScheduleTDS1', 'ScheduleTDS2', 'ScheduleTDS3', 'ScheduleTCS', 'Verification', 'TaxReturnPreparer', 'ScheduleESOP'],
    3 : [ 'PartA_GEN2', 'PARTA_BS', 'ManufacturingAccount', 'TradingAccount', 'PARTA_PL', 'PARTA_OI', 'PARTA_QD', 'ScheduleS', 'ScheduleHP', 'ITR3ScheduleBP', 'ScheduleDPM', 'ScheduleDOA', 'ScheduleDEP', 'ScheduleDCG', 'ScheduleESR', 'ScheduleCGFor23', 'Schedule112A', 'Schedule115AD', 'ScheduleVDA', 'ScheduleOS', 'ScheduleCYLA', 'ScheduleBFLA', 'ScheduleCFL', 'ITR3ScheduleUD', 'ScheduleICDS', 'Schedule10AA', 'Schedule80G', 'Schedule80GGA', 'Schedule80GGC', 'Schedule80C', 'Schedule80D', 'Schedule80DD', 'Schedule80U', 'Schedule80E', 'Schedule80EE', 'Schedule80EEA', 'Schedule80EEB', 'Schedule80RA', 'Schedule80_IA', 'Schedule80_IB', 'Schedule80_IC', 'ScheduleVIA', 'ScheduleAMT', 'ScheduleAMTC', 'ScheduleSI', 'ScheduleSPI', 'ScheduleIF', 'ScheduleEI', 'SchedulePTI', 'ScheduleTPSA', 'ScheduleFSI', 'ScheduleTR1', 'ScheduleFA', 'Schedule5A2014', 'ScheduleAL', 'ScheduleGST', 'PartB-TI', 'PartB_TTI', 'TaxReturnPreparer', 'ScheduleIT', 'ScheduleTDS1', 'ScheduleTDS2', 'ScheduleTDS3', 'ScheduleTCS', 'PartB-ATI', 'ScheduleESOP'],
    4 : ['IncomeDeductions', 'TaxComputation', 'TaxPaid','Schedule80G', 'Schedule80GGC', 'Schedule80DD', 'Schedule80U', 'Schedule80E', 'Schedule80EE', 'Schedule80EEA', 'Schedule80EEB', 'Schedule80C', 'ScheduleUs24B', 'ScheduleEA10_13A', 'Schedule80D', 'TaxExmpIntIncDtls', 'LTCG112A', 'TaxReturnPreparer', 'ScheduleBP', 'ScheduleIT', 'ScheduleTCS', 'TDSonSalaries', 'TDSonOthThanSals', 'ScheduleTDS3Dtls']
}

def get_schema_properties(target_key,reason_for_call):
    with open(f"D:/Akaike_Training/LegalLens.ai/Backend/Resolved_ITR_Files/resolved_schema_ITR_{itr_number}.json") as f:
        data = json.load(f)

    values = glom(data, (f'**.{target_key}',))
    if values :
        field_schema = {target_key: values[0]['properties']}
        print(field_schema)
        return field_schema
    else :
        # llm call to find the closest matching key in the schema
        prompt = f"""
            You are a highly experienced Financial Expert with deep expertise in Indian Income Tax Return (ITR) forms, their structures, field classifications, and income categorization. Your specialized knowledge includes understanding which income sources map to which ITR fields and forms.

            Your task is to analyze a newly claimed income source and identify the exact field where this income should be reported. You must first check if the appropriate field exists in the user's current ITR form. If not available, you need to identify the correct field in other ITR forms and recommend which ITR should be used.

            **Your Expertise Includes:**
            - Comprehensive knowledge of all ITR forms (ITR-1, ITR-2, ITR-3, ITR-4)
            - Understanding of income classification under Income Tax Act
            - Field-level knowledge of all ITR schedules and sections
            - Experience in income source to field mapping
            - Knowledge of ITR applicability and eligibility criteria

            **Input Information:**
            - **New Income Source Claimed:** {reason_for_call}
            - **Current ITR Number:** {itr_number}
            - **Available Fields in ITR-1:** {itr_fields_map[1]}
            - **Available Fields in ITR-2:** {itr_fields_map[2]}
            - **Available Fields in ITR-3:** {itr_fields_map[3]}
            - **Available Fields in ITR-4:** {itr_fields_map[4]}

            **Analysis Process:**

            1. **Understand the Income Source:**
            - Classify the nature of income (salary, business, capital gains, etc.)
            - Determine the appropriate income head under Income Tax Act
            - Consider the characteristics and reporting requirements

            2. **Check Current ITR:**
            - Search for applicable field in the current ITR form
            - Verify if the field name matches the income type
            - Check if current ITR form supports this income category

            3. **Search Other ITRs (if needed):**
            - If field not found in current ITR, search across all ITR forms
            - Identify which ITR form contains the appropriate field
            - Note the exact field name from the available fields list

            4. **Determine Correct ITR:**
            - If income source is supported in current ITR, return current ITR number
            - If not supported, identify the most appropriate ITR form
            - Consider ITR eligibility and complexity

            **Field Matching Guidelines:**
            - Look for exact schedule/section names (e.g., "ScheduleHP", "ScheduleOS", "ScheduleCG")
            - Match field names precisely as provided in the available fields lists
            - Consider sub-fields and nested structures
            - Prioritize specific fields over generic ones
            - Look for fields like: "rental_income", "business_income", "capital_gains_short_term", etc.

            **Decision Logic:**
            - If field exists in current ITR → Return current ITR with that field
            - If field doesn't exist in current ITR → Find appropriate ITR and field
            - If income source requires ITR-3 features → Recommend ITR-3
            - If multiple options exist → Choose the most specific and appropriate one

            **Response Format:**
            Return a JSON object with three keys: matching_field, reason, and current_itr.

            {{
                "matching_field": "exact_field_name_from_available_fields",
                "reason": "Clear explanation of why this field was selected and whether ITR change is needed",
                "current_itr": current itr number or recommended itr number as integer
            }}

            **Example Scenarios:**

            **Example 1 - Field exists in current ITR:**
            New Income: "Rental income from second property"
            Current ITR: 2
            Result:
            {{
                "matching_field": "ScheduleHP",
                "reason": "Rental income from house property should be reported in Schedule HP (House Property). Your current ITR-2 supports multiple house properties, so no ITR change needed.",
                "current_itr": 2
            }}

            **Example 2 - Field NOT in current ITR:**
            New Income: "Freelance consulting income"
            Current ITR: 1
            Result:
            {{
                "matching_field": "ScheduleBP",
                "reason": "Freelance consulting income is professional income and must be reported in Schedule BP (Business and Professional Income). ITR-1 doesn't support business/professional income, so you need to upgrade to ITR-3.",
                "current_itr": 3
            }}

            **Critical Instructions:**
            - Return ONLY valid JSON that can be parsed with json.loads()
            - Use exact field names as they appear in the available fields lists
            - Provide clear, concise reasons explaining the selection
            - If ITR needs to change, explicitly mention it in the reason
            - Consider the complete income profile when recommending ITR changes
            - Be specific about which schedule/section the field belongs to
            - Ensure the recommended ITR is the minimum required (don't over-recommend)

            **Important Considerations:**
            - Some income sources automatically require specific ITRs (e.g., business income → ITR-3)
            - Foreign income requires ITR-2 or ITR-3
            - Capital gains require ITR-2 or above
            - Multiple house properties need ITR-2 or above
            - Presumptive income can use ITR-4 under conditions

            Please analyze the new income source and identify the appropriate field and ITR form:
        """

        response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=prompt,
        config=web_search_config
        )
        try :
            res = json.loads(response.text)
        except json.JSONDecodeError:
            print("JSON Decode Error, trying to fix the response")
            res = json.loads(response.text[7:-3])

        print("NEW SCHEMA FETCHED : ", res)
        print("Recommended ITR Number : ", res["current_itr"])

        return res["matching_field"]
    

def update_json(data) :
    global ais_summary , ais_data
    insert_data_to_weaviate(data)
    for tmp, value in data.items() :
        key = tmp + " _data"
        # if key in ais_summary.keys() :
        #     ais_summary[key].append(value)
        # else :
        #     ais_summary[key] = [value]
        
        ais_summary.append({key:value})
        
        if key in ais_data.keys() :
            ais_data[key].append(value)
        else :
            ais_data[key] = [value]

        # if key in required.keys() :
        #     required[key].append(key)
        # else :
        #     required[key] = [key]

        return


def get_question():
    global additional
    if additional == {} :
        return "No more questions left, You can conclude the session by saying END_OF_CONVERSATION." 
    return additional.popitem()


def get_summary():
    return ais_summary


def get_ais_summary(pdf_path, password=None):
    global ais_summary, ais_data
    with pdfplumber.open(pdf_path, password=password) as pdf:
        second_rows = []
        temp_ais_data = defaultdict(list)
        
        columns = None

        for page in pdf.pages:
            for table in page.extract_tables():
                if len(table) >= 3 and len(table[1]) >= 2:
                    key = table[1][1]   
                    # data_rows = table[2:]  
                    data_rows = table
                    headers = table[2]     
 
                    df = pd.DataFrame(data_rows)

                    json_str = df.to_json(orient="records")
                    temp_ais_data[key].append(json.loads(json_str))
                if table and len(table) > 2:
                    if columns is None:
                        columns = table[0]
                    second_rows.append(table[1]) 

        df_second_rows = pd.DataFrame(second_rows)
        ais_summary_tmp = df_second_rows.to_json(orient="records")

        ais_summary = json.loads(ais_summary_tmp)

        ais_data = dict(temp_ais_data)

        return [ais_summary, ais_data]


def classify_regime():
    global itr_number, ais_summary

    prompt = f"""
        You are a highly experienced Financial Expert with specialized expertise in Indian Income Tax planning, tax optimization, and comprehensive understanding of both Old and New Tax Regimes. Your role is to analyze a taxpayer's complete financial profile and recommend the most beneficial tax regime.

        Your task is to thoroughly analyze the user's financial data, calculate tax liability under both regimes, and recommend the optimal tax regime (OLD or NEW) that results in maximum tax savings for the taxpayer.

        Do web search to get the latest tax slabs, rates, and deduction limits for the relevant assessment year.

        **Your Expertise Includes:**
        - Deep knowledge of Old Tax Regime provisions and deductions
        - Comprehensive understanding of New Tax Regime structure and benefits
        - Tax calculation and optimization strategies
        - Comparative analysis of tax regimes
        - Understanding of various deductions, exemptions, and their eligibility
        - Current tax slabs and rates for both regimes

        **Analysis Process:**

        1. **Data Review:**
        - Examine total gross income
        - Identify all deductions claimed/available (80C, 80D, etc.)
        - Check exemptions (HRA, LTA, etc.)
        - Review home loan interest if applicable
        - Calculate net taxable income for both regimes

        2. **Do Web Search:**
        - Find latest tax slabs, rates, and deduction limits for FY 2024-25


        3. **Old Regime Calculation:**
        - Start with gross total income
        - Subtract all eligible deductions and exemptions
        - Calculate tax on net taxable income using old slabs
        - Determine final tax liability

        4. **New Regime Calculation:**
        - Start with gross total income
        - Subtract standard deduction only
        - Calculate tax on net taxable income using new slabs
        - Determine final tax liability

        4. **Comparative Analysis:**
        - Compare tax liability under both regimes
        - Calculate absolute savings
        - Calculate percentage savings
        - Consider ease of filing and compliance

        5. **Recommendation:**
        - Choose regime with LOWER tax liability
        - Provide clear reasoning with numbers
        - Show comparative data for transparency

        **Input Information:**
        - **User Financial Summary:** {ais_summary}
        - **Assessment Year:** 2025-26

        **Decision Factors:**

        **OLD Regime is Better When:**
        - Taxpayer has significant deductions (80C, 80D, etc.)
        - HRA exemption is substantial
        - Home loan interest is being paid
        - Total deductions exceed Rs 2,50,000-3,00,000
        - Investments in tax-saving instruments are high

        **NEW Regime is Better When:**
        - Taxpayer has minimal or no deductions
        - No HRA benefit or home loan
        - Gross income is moderate (Rs 7-15 lakhs range)
        - Prefers simplicity over tax planning
        - Total deductions are less than Rs 1,50,000


        **Response Format:**
        Return a JSON object with optimal_regime and detailed reason with comparative data.

        {{
            "optimal_regime": "OLD",
            "reason": "Based on your financial profile, the Old Tax Regime is more beneficial. Here's why:nComparative Analysis:Old Tax Regime:• Gross Income: Rs 12,00,000• Standard Deduction: Rs 50,000• 80C Deductions: Rs 1,50,000• 80D Deduction: Rs 25,000• HRA Exemption: Rs 1,20,000• Net Taxable Income: Rs 8,55,000• Tax Liability: Rs 1,07,250New Tax Regime:• Gross Income: Rs 12,00,000• Standard Deduction: Rs 50,000• Net Taxable Income: Rs 11,50,000• Tax Liability: Rs 1,65,000💰 Savings with Old Regime: Rs 57,750 (35% less tax)You're saving significantly because of your substantial 80C investments (Rs 1,50,000) and HRA exemption (Rs 1,20,000). These deductions reduce your taxable income substantially under the Old Regime, resulting in considerable tax savings."
        }}

        **Important Instructions:**
        - Return ONLY valid JSON that can be parsed with json.loads()
        - "optimal_regime" must be either "OLD" or "NEW" (in CAPS)
        - Reason must include comparative data with actual numbers
        - Show clear calculation breakdown for both regimes
        - Highlight the savings amount and percentage
        - Make the reason detailed yet easy to understand
        - Use proper formatting for readability (newlines, bullet points)
        - Be specific about which deductions/exemptions make the difference

        **Web Search Requirement:**
        If you need to verify current tax slabs, rates, deduction limits, or recent changes in tax laws for the assessment year, perform a web search to ensure your calculations and recommendations are based on the latest regulations.

        **Critical Success Factors:**
        - Accurate tax calculations for both regimes
        - Clear comparative analysis with numbers
        - Transparent reasoning showing why one regime is better
        - Consideration of all available deductions and exemptions
        - Up-to-date tax rates and provisions
        - Actionable recommendation that maximizes tax savings

        Please analyze the user's financial summary and recommend the optimal tax regime with detailed comparative analysis:
    """
    

    response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=prompt,
    config=web_search_config 
    )
    try :
        res = json.loads(response.text)
    except json.JSONDecodeError:
        print("JSON Decode Error, trying to fix the response")
        res = json.loads(response.text[7:-3])

    print("Classified ITR Type:")
    print(res)
    regime_type = res['optimal_regime']
    print("Regime Type : ", regime_type)
    print("Reason", res['reason'])

    
    return res

def classify_itr() :
    global ais_summary, itr_number
    prompt = f"""
        You are a professional Financial Assistant with extensive expertise in Indian Income Tax Returns (ITR) and tax regulations. Your role is to help taxpayers choose the most appropriate ITR form based on their Annual Information Statement (AIS) summary.

        Your task is to analyze the provided AIS statement summary and recommend the perfect ITR form for the taxpayer. You must consider all income sources, deductions, and financial activities mentioned in the AIS to make an accurate recommendation.
        Perform web searches if necessary to ensure your recommendations are up-to-date with the latest tax regulations.
        Today's Date: {datetime.now().strftime("%Y-%m-%d")}
        **Analysis Guidelines:**
        1. Examine all income sources mentioned in the AIS summary
        2. Check for business/professional income, capital gains, foreign income, etc.
        3. Consider the complexity of financial transactions
        4. Verify eligibility criteria for each ITR form
        5. Choose the most appropriate and compliant ITR form

        **AIS Statement Summary:**
        {ais_summary}

        **Important Instructions:**
        - Provide your response ONLY in valid JSON format
        - Ensure the JSON is parseable with json.loads()
        - Be friendly and casual in your reasoning
        - Keep the reason short but detailed enough to justify your choice
        - Use proper JSON syntax with double quotes for strings
        - DO not include words like "JSON" or "json" or "code" in your response
        - Do not provide the response as code blocks or markdown


        **Response Format:**

        {{
            "itr_type": number,
            "reason": your friendly and casual explanation here
        }}


        Please analyze the AIS summary and provide your ITR recommendation: 
        """
    response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=prompt,
    config=web_search_config 
    )
    try :
        res = json.loads(response.text)
    except json.JSONDecodeError:
        print("JSON Decode Error, trying to fix the response")
        res = json.loads(response.text[7:-3])

    print("Classified ITR Type:")
    print(res)
    itr_number = int(res['itr_type'])
    
    return res


@app.route("/upload_form16", methods=["POST"])
def parse_form_16() :
    global ais_summary , ais_data, additional , required , itr_number
    if "pdf" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    pdf_file = request.files["pdf"]
    with pdfplumber.open(pdf_file) as pdf:
        full_text = ""
        for page_number, page in enumerate(pdf.pages, start=1):
            text = page.extract_text()
            if text:
                full_text += f"\n--- Page {page_number} ---\n"
                full_text += text
            else:
                full_text += f"\n--- Page {page_number} ---\n(No text found)\n"

        print(full_text)
    # return full_text
    prompt  = f"""
        You are an expert Tax Professional with specialized expertise in Indian Income Tax Return filing and comprehensive knowledge of Form-16 structure and requirements. Your role is to accurately extract all relevant information from Form-16 documents that are essential for ITR filing.

        Your task is to meticulously analyze the provided Form-16 document and extract all potential details required for Income Tax Return filing. You must ensure complete data extraction, accurate formatting, and proper categorization of all information.

        **Your Expertise Includes:**
        - Deep understanding of Form-16 Parts A and B structure
        - Knowledge of salary components and their tax treatment
        - Understanding of TDS provisions and reporting requirements
        - Experience in extracting and organizing tax-relevant data
        - Familiarity with various deductions, exemptions, and allowances

        **Form-16 Structure Knowledge:**

        **PART A - TDS Certificate Details:**
        - Employee and Employer details (Name, PAN, TAN, Address)
        - Period of employment
        - Total TDS deposited and remitted
        - Quarter-wise TDS details

        **PART B - Salary and Tax Computation:**
        - Gross salary components (Basic, DA, HRA, Special Allowance, etc.)
        - Exemptions claimed (HRA exemption, LTA, etc.)
        - Deductions under Chapter VI-A (80C, 80D, 80G, etc.)
        - Taxable income computation
        - Tax calculation at applicable rates
        - Relief under section 89, if any
        - TDS deducted month-wise


        **Input Information:**
        - **Form-16 Document**: {full_text}

        **Extraction Guidelines:**
        - Extract ALL numerical values accurately with proper decimal places
        - Capture all text fields exactly as mentioned in Form-16
        - Preserve the structure of month-wise and quarter-wise data
        - Exclude zero values where applicable 
        - Extract dates in proper format (DD/MM/YYYY or YYYY-MM-DD)
        - Ensure PAN and TAN are captured correctly
        - Maintain the breakdown of salary components
        - Capture all deduction details with amounts

        **Response Format:**
        Return a comprehensive JSON object with "form-16" as the root key, containing all extracted information organized logically.

        {{
            "form-16": {{
                "assessment_year": "2024-25",
                "financial_year": "2023-24",
                "employee_details": {{
                    "name": "Employee Name",
                    "pan": "ABCDE1234F",
                    "address": "Complete Address"
                }},
                "employer_details": {{
                    "name": "Employer Name",
                    "tan": "ABCD12345E",
                    "address": "Complete Address"
                }}
            }}
            "summary" : {{
                < impactful data points from the form-16 as object >
            }}
 
    
        }}

        **Critical Instructions:**
        - Ensure JSON is parseable with json.loads()
        - Extract ALL available information from the Form-16
        - Use proper number formatting (integers for whole amounts, decimals where needed)
        - Exclude the sections if the fields are zero, extract only meaningful data
        - Maintain accuracy in numerical extraction
        - Preserve date formats consistently
        - Capture complete employer and employee details
        - Extract month-wise TDS breakdown accurately

        **Validation Checklist:**
        - ✓ All personal details captured correctly
        - ✓ Salary components extracted completely
        - ✓ Exemptions and deductions identified
        - ✓ Tax computation details accurate
        - ✓ TDS details (monthly and quarterly) complete
        - ✓ JSON structure is valid and parseable
        - ✓ All numerical values are accurate

        Please analyze the provided Form-16 document and extract all relevant information in the specified JSON format:
        """
    
    response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=prompt,
    config=web_search_config
    )
    try :
        res = json.loads(response.text)
    except json.JSONDecodeError:
        print("JSON Decode Error, trying to fix the response")
        res = json.loads(response.text[7:-3])
    
    ais_data["form-16"] = res["form-16"]
    # ais_summary["form-16"] = res["summary"]
    ais_summary.append({"form-16":res["summary"]})

    
    return jsonify({"message": "Form-16 parsed successfully", "form-16": res["form-16"],"summary": res["summary"]})


# New flow , classify itr after chat 
def list_fields():
    global ais_summary , ais_data, additional , required , itr_number
    classify_itr_res = classify_itr()
    itr_number = int(classify_itr_res['itr_type'])
    itr_fields = itr_fields_map[itr_number]
    info_codes = ais_data.keys()
    prompt = f"""
        You are a professional Finance Assistant with deep expertise in Indian Income Tax Return filing and extensive knowledge of ITR forms and their field requirements. Your specialization includes mapping AIS (Annual Information Statement) data to appropriate ITR fields and identifying additional fields that may need manual input.

        Your task is to analyze the provided AIS summary and ITR type, then determine which fields should be filled based on the available data and identify additional fields that would require information not present in the AIS document.
        Perform web searches if necessary to ensure your recommendations are up-to-date with the latest tax regulations.
        Today's Date: {datetime.now().strftime("%Y-%m-%d")}

        **Your Expertise Includes:**
        - Comprehensive knowledge of all ITR form structures and field requirements
        - Understanding of AIS data sources and limitations
        - Experience in identifying income sources that may not appear in AIS
        - Knowledge of deductions, exemptions, and manual entry requirements

        **Analysis Process:**
        1. **Review the AIS Summary**: Identify all income sources, TDS details, and financial transactions mentioned
        2. **Map to ITR Fields**: Based on the specified ITR type, determine which fields correspond to the AIS data
        3. **Identify Required Fields**: List all fields that should be filled based on the AIS information and the relevant information_codes which are required to fill the ITR
        4. **Identify Additional Fields**: Determine fields that typically require manual input (not available in AIS)

        **Input Data:**
        - **AIS Summary**: {ais_summary}
        - **ITR Type**: ITR-{itr_number}
        - **Available ITR Fields**: {itr_fields}
        - Available information_codes : {info_codes}


        **Instructions:**
        - Provide response in valid JSON format only
        - Ensure JSON is parseable with json.loads()
        - Be specific about field names as provided in available_fields
        - For the fields under required, map the field names to the relevant information_codes which are required to fill the ITR from the provided list
        - Keep reasons in additional fields short and clear
        - Focus on practical tax filing requirements

        **Response Format:**

        {{
            "required": {{
                "field_name_1": "list_of_information_codes",
                "field_name_2": "list_of_information_codes",
            }},
            "additional": {{
                "field_name_3": "Rental Income",
                "field_name_4": "80C Deductions",
                "field_name_5": "Medical Insurance Premium"
            }}
        }}


        **Important Notes:**
        - Only include fields that are actually present in the available_fields list
        - Required fields should have corresponding data in the AIS summary
        - Additional fields are those commonly needed but not available in AIS
        - Consider the specific ITR type's requirements and limitations
        - Be thorough but practical in your field selection
        - DO not include words like "JSON" or "json" or "code" in your response
        - Do not provide the response as code blocks or markdown


        Please analyze the provided information and return the field mapping:
        """
    
    response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=prompt,
    config=web_search_config
    )
    try :
        res = json.loads(response.text)
    except json.JSONDecodeError:
        print("JSON Decode Error, trying to fix the response")
        res = json.loads(response.text[7:-3])
    
    additional = res['additional']
    required = res['required']

    print("Additional Fields to be filled manually : ")
    print(additional)
    print("Required Fields to be filled from AIS : ")   
    print(required)
        
    return res

def fill_field(itr_number,targetField,relevant_data=[]) :
    global ais_data
    with open(f"D:/Akaike_Training/LegalLens.ai/Backend/Resolved_ITR_Files/resolved_schema_ITR_{itr_number}.json") as f:
        data = json.load(f)

    values = glom(data, (f'**.{targetField}',))
    field_schema = {targetField: values[0]}
    print("Field Schema",field_schema)
    # relevant_data = {k : ais_data[k] for k in information_codes if k in ais_data}
    print("Relevant data",relevant_data)
    
    prompt = f"""
        You are a highly experienced Finance Expert with specialized expertise in Indian Income Tax Return (ITR) filing, tax regulations, and form completion. You have extensive knowledge of ITR schemas, field requirements, validation rules, and current tax laws.

        Your task is to accurately fill a specific ITR field/schedule based on the provid ed schema and relevant data. You must ensure complete compliance with current tax regulations and proper data formatting according to the schema requirements.

        Perform web searches if necessary to ensure your recommendations are up-to-date with the latest tax regulations.

        **Your Expertise Includes:**
        - Deep understanding of all ITR forms and their detailed schemas
        - Knowledge of current Income Tax Act provisions and recent amendments
        - Experience in data validation and error-free form completion
        - Understanding of field dependencies and calculation requirements
        - Awareness of common filing errors and how to avoid them

        **Key Responsibilities:**
        1. **Schema Analysis**: Thoroughly understand the provided field schema structure
        2. **Data Mapping**: Map the relevant data to appropriate schema fields
        3. **Validation**: Ensure all data meets schema requirements and tax regulations
        4. **Calculation**: Perform necessary calculations for derived fields
        5. **Compliance**: Verify adherence to current tax laws and filing requirements
        6. **Formatting**: Return data in exact schema format with proper data types

        **Input Information:**
        - **ITR Form Type**: {itr_number}
        - **Field Schema**: {field_schema}
        - **Relevant Data**: {relevant_data}
        - **Today's Date**: {datetime.now().strftime("%Y-%m-%d")}
        - **Assessment Year**: 2025-26

        **Important Guidelines:**
        - Fill ONLY the fields that have corresponding data available
        - Use exact field names as specified in the schema
        - Maintain proper data types (string, number, boolean, array, object)
        - Apply current tax rates and limits for the assessment year
        - Include mandatory fields even if zero values
        - Follow proper rounding rules for monetary amounts
        - Ensure cross-field consistency and validation

        **Web Search Requirements:**
        If you need to verify current tax regulations, rates, limits, or recent amendments that may affect the field completion, perform web searches to ensure accuracy and compliance with the latest tax laws.

        **Data Validation Checklist:**
        - ✓ All mandatory fields are included
        - ✓ Data types match schema requirements
        - ✓ Numerical values are properly formatted
        - ✓ Calculations are accurate based on current rates
        - ✓ Cross-references between fields are consistent
        - ✓ Compliance with current tax regulations

        **Response Format:**
        Return the filled data as a JSON object with the field name as the key and the completed schema-compliant data as the value.

        {{
            "FieldName": {{
                "field1": "value1",
                "field2": 12345.67,
                "field3": true,
                "nested_object": {{
                    "sub_field1": "sub_value1",
                    "sub_field2": 0
                }},
                "array_field": [
                    {{"item1": "value1"}},
                    {{"item2": "value2"}}
                ]
            }}
        }}

        **Critical Instructions:**
        - Provide the final response as a Simple string e.g : '{{'key':'val'}}'
        - Ensure JSON is parseable with json.loads()
        - Use proper number formatting (no unnecessary decimals for whole numbers)
        - Include all required fields from the schema
        - Double-check calculations and cross-field dependencies
        - DO not include words like "JSON" or "json" or "code" in your response
        - Do not provide the response as code blocks or markdown

        **Current Assessment Year Context**: 2025-26
        **Date of Analysis**: Today's date for regulation compliance

        Please analyze the provided schema and data, perform any necessary web searches for current regulations, and return the accurately filled ITR field:
        """

    response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=prompt,
    config=web_search_config
    )
    print(response.text)
    try :
        if response.text is None :
            return {}
        res = json.loads(response.text)
    except json.JSONDecodeError:
        print("JSON Decode Error, trying to fix the response")
        try : 
            res = json.loads(response.text[7:-3])
        except :
            print("JSON Decode Error, trying to fix the response")
            res = json.loads(response.text[4:-3])
    return res
    
form_details_map = {
    1 :{
                "FormName": "ITR-1",
                "Description": "For Indls having Income from Salary, Pension, family pension and Interest",
                "AssessmentYear": "2025",
                "SchemaVer": "Ver1.0",
                "FormVer": "Ver1.0"
            },
    2 :{
                "FormName": "ITR-2",
                "Description": "For Individuals and Hindu Undivided Families (HUFs) not having income from profits and gains of business or profession. This includes income from capital gains, more than one house property, and foreign assets/income",
                "AssessmentYear": "2025",
                "SchemaVer": "Ver1.0",
                "FormVer": "Ver1.0"
            },
    3 :{
                "FormName": "ITR-3",
                "Description": "For Individuals and Hindu Undivided Families (HUFs) having income from profits and gains of business or profession. The form can also be used by partners in a firm",
                "AssessmentYear": "2025",
                "SchemaVer": "Ver1.0",
                "FormVer": "Ver1.0"
            },
    4 :{
                "FormName": "ITR-4",
                "Description": "For Resident Individuals, HUFs, and Firms (other than LLP) having total income up to ₹50 lakh and having income from business and profession computed under presumptive taxation schemes (Sections 44AD, 44ADA, and 44AE)",
                "AssessmentYear": "2025",
                "SchemaVer": "Ver1.0",
                "FormVer": "Ver1.0"
            },
}


def get_user_info(item):
    global current_user
    try:
        from bson import ObjectId
        user = users_collection.find_one({"_id": ObjectId(current_user)})
        
        if not user:
            return None
        
        return user.get(item, "Not found")
        
    except Exception as e:
        print(f"Error retrieving user info: {str(e)}")
        return None
    

filled_itr = {}

def create_filled_itr(itr_number,required_fields):
    global filled_itr
    tmp_itr = {}

    list_fields()
    print("STARTED FILING ...")
    for field in required_fields :
        relevant_data = {k : ais_data[k] for k in required_fields[field] if k in ais_data}
        filled_data = fill_field(itr_number,field,relevant_data)
        tmp_itr.update(filled_data)
        time.sleep(15)

    tmp_itr.update({f"Form_ITR{itr_number}" : form_details_map[itr_number]})
    temp_user_info = get_user_info("PersonalInfo")
    temp_user_info.pop("Status", None)
    tmp_filing_status = get_user_info("FilingStatus")
    tmp_tax_regime = classify_regime()
    tax_regime = "Y" if tmp_tax_regime['optimal_regime'] == "NEW" else "N"
    if itr_number in [2,3] :
        tmp_itr.update({
            "PartA_GEN1" : {
                "PersonalInfo" : temp_user_info,
                "FilingStatus": {
                    "ReturnFileSec": tmp_filing_status["ReturnFileSec"],
                    "ItrFilingDueDate": "2025-07-31",
                    "OptOutNewTaxRegime": tax_regime,
                    "SeventhProvisio139": "N"
                    }
                }
            })
    else :
        tmp_itr.update({
            "PersonalInfo" : temp_user_info,
        })
        tmp_itr.update({
                "FilingStatus": {
                    "ReturnFileSec": tmp_filing_status["ReturnFileSec"],
                    "ItrFilingDueDate": "2025-07-31",
                    "OptOutNewTaxRegime": tax_regime,
                    "SeventhProvisio139": "N"
                }
        })
    tmp_itr.update({
        "Verification" : {
            "Declaration": {
                "AssesseeVerName": temp_user_info["AssesseeName"]["FirstName"] + " " + temp_user_info["AssesseeName"]["SurNameOrOrgName"],
            }
        }
    })
    tmp_acc_dtls = get_user_info("Refund")
    tmp_itr.update({
        "Refund" : {
            "RefundDue": 0,
            "BankAccountDtls" : tmp_acc_dtls["BankAccountDtls"]
            
        }
    })

    
    # filled_data = fill_field(itr_number,"PersonalInfo",required_fields[field])
    # fields =  [ "Form_ITR1", "PersonalInfo", "FilingStatus", "Verification", "Refund"]
    # fields =  [ ]
    # for field in fields:
        
    filled_itr = {"ITR": {f"ITR{itr_number}" : tmp_itr }}

    return filled_itr

# upload PDF endpoint

@app.route("/upload", methods=["POST"])
def upload_pdf():
    global ais_summary, ais_data
    if "pdf" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    pdf_file = request.files["pdf"]
    password = request.form.get("password")
    # print(f"Received password: {password}")
    # Save the file (optional)
    # save_path = os.path.join("uploads", pdf_file.filename)
    # os.makedirs("uploads", exist_ok=True)
    # pdf_file.save(save_path)

    with pdfplumber.open(pdf_file, password=password) as pdf:
        second_rows = []
        temp_ais_data = defaultdict(list)
        
        columns = None

        for page in pdf.pages:
            for table in page.extract_tables():
                if len(table) >= 3 and len(table[1]) >= 2:
                    key = table[1][1]   
                    # data_rows = table[2:]  
                    data_rows = table[:]
                    headers = table[2]     
 
                    df = pd.DataFrame(data_rows)

                    json_str = df.to_json(orient="records")
                    temp_ais_data[key].append(json.loads(json_str))
                if table and len(table) > 2:
                    if columns is None:
                        columns = table[0]
                    second_rows.append(table[1]) 

        df_second_rows = pd.DataFrame(second_rows)
        ais_summary = df_second_rows.to_json(orient="records")
        ais_summary = json.loads(ais_summary)

        ais_data = dict(temp_ais_data)

        list_fields()
        setup_rag()

        # return [summary, ais_data]

    return jsonify({"success" : True, "message": "File uploaded successfully", "file_path": "file_not_saved","summary": "summary","ais_data": "ais_data"}), 200

@app.route('/get_summary_view', methods=['POST'])
def get_summary_view() :
    
    filed_itr = create_filled_itr(itr_number,required)
    
    # print("Sleeping for 10 seconds to simulate processing...")
    # time.sleep(10)

    return jsonify({"success": True,"summary_json":filed_itr})



history = list([
        # types.Content(
        #     role="model",
        #     parts=[
        #         types.Part.from_text(text=prompt),
        #     ],
        # ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text="Hello! I'm here to help you identify and gather information about all your income sources for accurate tax filing. I'll ask you some questions to ensure we cover everything comprehensively."),
            ],
        ),
    ])

@app.route('/get_details', methods=['POST'])
def get_details_chat() :
    global history
    # data = request.get_json()
    # user_message = data.get("user_query")
    # is_new_chat = data.get("is_new_chat")
    # converting to forms to accept image
    user_message = request.form.get("user_message","Here are the details")  
    is_new_chat = int(request.form.get("is_new_chat"))   
    uploaded_file = request.files.get("image")      # uploaded image
    print(f"user_message: {user_message}, is_new_chat: {is_new_chat}, uploaded_file: {uploaded_file}")
    if uploaded_file:
        img = Image.open(uploaded_file)
        img_text = pytesseract.image_to_string(img, config=custom_config)
        print(img_text)

    if is_new_chat :
        history = list([
            types.Content(
                role="model",
                parts=[
                    types.Part.from_text(text="Hello! I'm here to help you identify and gather information about all your income sources for accurate tax filing. I'll ask you some questions to ensure we cover everything comprehensively.Can we Start?"),
                ],
            ),
        ])
    if uploaded_file :
        history.append(
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=f"Text extracted from the image: {img_text} /n {user_message}"),
                ],
            )
        )
    else :
        history.append(
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=f"{user_message}"),
            ],
        )
    )

    response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents = history ,
    config=config
    )
    if response.function_calls :
        for call in response.function_calls :
            print(call.name)
            print(call.args)
            if call.name == "get_question" :
                question = get_question()
                print(question)
                if len(history) > 5 :
                    history = history[-3:] # Memory management to avoid context overflow
                    if type(history[0]) is types.Part :
                        history.pop(0)
                    print("History trimmed !!!!!")
                    history.insert(0,
                        types.Content(
                            role="model",
                            parts=[
                                types.Part.from_text(text="Please remember that it is a continuing conversation and you have the limited context of previous messages"),
                            ],
                        ),
                    )

                history.append(response.candidates[0].content)
                function_response_contents  = types.Part.from_function_response(
                    name=call.name,
                    response={"contents": question}
                )
                history.append(
                    function_response_contents
                )

            if call.name == "web_search" :
                search_query = call.args["query"]
                search_results = web_search_client.models.generate_content(
                                    model="gemini-2.5-pro",
                                    contents=search_query,
                                    config=types.GenerateContentConfig(
                                        system_instruction="You are a web search agent. Provide raw, concise and relevant information based on the query.",
                                        tools=[
                                            types.Tool(google_search=types.GoogleSearch()),
                                        ]
                                    )).text
                print(search_results)
                history.append(response.candidates[0].content)
                function_response_contents  = types.Part.from_function_response(
                    name=call.name,
                    response={"contents": search_results}
                )
                history.append(
                    function_response_contents
                )
            
            if call.name == "get_schema_properties" :
                schema = get_schema_properties(call.args["target_key"],call.args["reason_to_call"])
                print(schema)
                history.append(response.candidates[0].content)
                function_response_contents  = types.Part.from_function_response(
                    name=call.name,
                    response={"contents": schema}
                )
                history.append(
                    function_response_contents
                )
            
            
            if call.name == "get_ais_summary" :
                schema = get_summary()
                print(schema)
                history.append(response.candidates[0].content)
                function_response_contents  = types.Part.from_function_response(
                    name=call.name,
                    response={"contents": schema}
                )
                history.append(
                    function_response_contents
                )
            
            if call.name == "update_json" :
                schema = update_json(call.args["data"])
                print(schema)
                history.append(response.candidates[0].content)
                function_response_contents  = types.Part.from_function_response(
                    name=call.name,
                    response={"contents": schema}
                )
                history.append(
                    function_response_contents
                )
        response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents = history,
        config=config ,
        )

    history.append(
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text=response.text),
            ],
        )
    )

    if "END_OF_CONVERSATION" in response.text :
        classify_itr()
        return jsonify({"response": "Thank you for the conversation, If you have any more income sources please let me know. Else continue to the next page.","proceed":True})

    return jsonify({"response": response.text,"proceed":False})



# RAG 

get_relevent_data_tool =  types.FunctionDeclaration(
    name="get_relevent_data",
    description="Get the relevant data required to answer the user's query.",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The user query to retrieve relevant data for."
            }
        },
        "required": ["query"],
    },
)

def get_relevent_data(query) :
    coll = weaviate_client.collections.use(current_coll)
    response = coll.query.hybrid(query=query, limit=3,vector = client.models.embed_content(
                        model="gemini-embedding-001",
                        contents=query,
                        config=types.EmbedContentConfig(task_type="QUESTION_ANSWERING")).embeddings[0].values)
    context = ""
    for o in response.objects:
        print(o.properties)
        context += o.properties['data'] + "\n"

    print("Context: ", context)

    return context


rag_prompt = f"""
      You are a friendly and knowledgeable Financial Assistant with expertise in personal finance, tax planning, investment strategies, and comprehensive financial management. Your role is to help users understand and manage their financial data while providing expert guidance in a warm, approachable manner.

      Your primary goal is to assist users with all aspects of their financial data, answer their queries clearly, and provide actionable insights that help them make informed financial decisions.

      Today's Date: {datetime.now().strftime("%Y-%m-%d")}

      **Your Expertise Includes:**
      - Personal finance management and budgeting
      - Income tax planning and optimization
      - Investment strategies and portfolio analysis
      - Expense tracking and analysis
      - Financial goal planning
      - Tax-saving opportunities identification
      - Regulatory compliance and updates
      - Financial literacy and education

      **Available Tools :**

      1. **get_relevant_data(query)** - Fetch Specific User Financial Data
         - Use when: User asks about specific aspects of their financial information
         - Use when: You need targeted data like "my salary details", "TDS deducted", "investment in 80C"
         - Use when: Query is about a particular transaction, income source, or expense
         - This fetches relevant chunks from the user's financial database
         - Example queries: "salary income", "house rent allowance", "bank interest income", "mutual fund investments"

      2. **get_ais_summary()** - Fetch Complete User Financial Summary
         - Use when: User asks for overall financial picture or comprehensive analysis
         - Use when: You need complete data to calculate totals, compare multiple sources
         - Use when: Query requires understanding the full financial context
         - Use when: User asks "show me everything" or "complete financial status"
         - Returns the entire AIS summary with all income sources, deductions, and tax details

      3. **web_search(query)** - Web Search for Current Information
         - Use when: User asks about current tax rates, recent policy changes, market updates
         - Use when: You need latest financial regulations, investment options, or news
         - Use when: Information may have changed recently or requires real-time data
         - Example queries: "current income tax slabs 2024-25", "latest NPS rules", "investment opportunities 2024"

      **Tool Selection Strategy:**
      - Start with **get_relevant_data()** for specific queries about user's finances
      - Use **get_ais_summary()** when you need the complete financial picture
      - Do web_search for current rates, policies, or external information
      - Combine tools when necessary for comprehensive answers

      **Conversation Guidelines:**

      1. **Be Friendly & Approachable:**
         - Use warm, conversational language
         - Avoid overly technical jargon unless necessary
         - Show empathy and understanding
         - Encourage questions and provide reassurance

      2. **Be Clear & Helpful:**
         - Explain financial concepts in simple terms
         - Break down complex information into digestible points
         - Provide practical examples when explaining
         - Offer actionable advice and next steps

      3. **Be Thorough & Accurate:**
         - Use appropriate tools to fetch accurate information
         - Verify current regulations using web_search when needed
         - Cross-reference data for consistency
         - Acknowledge when you're uncertain and search for answers

      4. **Be Proactive:**
         - Identify potential tax-saving opportunities
         - Point out discrepancies or areas needing attention
         - Suggest optimizations and improvements
         - Offer relevant advice beyond the immediate question

      **Response Structure:**
      1. Acknowledge the user's query warmly
      2. Use appropriate tool(s) to gather necessary information
      3. Provide clear, friendly explanation
      4. Offer additional insights or suggestions when relevant
      5. Invite follow-up questions

      **Important Guidelines:**

      - **Always use tools wisely** - Don't make assumptions about user's financial data
      - **Search when needed** - Use web_search for current rates, policies, regulations
      - **Be data-driven** - Base advice on actual user data from the tools
      - **Stay current** - Use web_search for latest tax laws and financial regulations
      - **Use Multiple tools if needed at single time** - To faster response time
      
      **Response Style:**
      - Conversational and warm, not robotic
      - Give short and clear answers
      - Use emojis sparingly when appropriate 😊
      - Keep paragraphs short and readable
      - Use bullet points for clarity when listing multiple items
      - End with helpful next steps or offers to help further

      **Critical Success Factors:**
      - Accurate information through proper tool usage
      - Clear, jargon-free communication
      - Proactive, helpful suggestions
      - Building user confidence in financial management
      - Creating a supportive, judgment-free environment

      Remember: You're not just answering questions - you're helping users feel confident and empowered about their finances. Be their trusted financial companion who makes complex financial matters simple and manageable!

      Now, help the user with their query in a friendly, knowledgeable manner.
      """

rag_config = types.GenerateContentConfig(
    system_instruction=rag_prompt,
    tools=[
        types.Tool(
            function_declarations=[get_ais_summary_tool,get_relevent_data_tool,web_search_tool],
            # google_search=types.GoogleSearch()
        ),
    ]
)

rag_history = list([
        # types.Content(
        #     role="model",
        #     parts=[
        #         types.Part.from_text(text=prompt),
        #     ],
        # ),
        types.Content(
            role="model",
            parts=[
                    types.Part.from_text(text="Hello! I'm here to help you to clarify your tax related queries based on your data. How can I assist you today?"),
            ],
        ),
    ])


@app.route('/agentic_rag_chat', methods=['POST'])
def agentic_rag_chat() :
    global rag_history
    # data = request.get_json()
    # user_message = data.get("user_query")
    # is_new_chat = data.get("is_new_chat")
    # converting to forms to accept image
    user_message = request.form.get("user_message","Here are the details")  
    is_new_chat = int(request.form.get("is_new_chat"))  
    uploaded_file = request.files.get("image")    # uploaded image
    print(f"user_message: {user_message}, is_new_chat: {is_new_chat}, uploaded_file: {uploaded_file}")
    if uploaded_file:
        img = Image.open(uploaded_file)
        img_text = pytesseract.image_to_string(img, config=custom_config)
        print(img_text)

    if is_new_chat :
        rag_history = list([
            types.Content(
                role="model",
                parts=[
                    types.Part.from_text(text="Hello! I'm here to help you to clarify your tax related queries based on your data. How can I assist you today?"),
                ],
            ),
        ])
    if uploaded_file :
        rag_history.append(
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=f"Text extracted from the image: {img_text} /n {user_message}"),
                ],
            )
        )
    else :
        rag_history.append(
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=f"{user_message}"),
            ],
        )
    )

    response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents = rag_history ,
    config=rag_config
    )
    if response.function_calls :
        for call in response.function_calls :
            print(call.name)
            print(call.args)

            if call.name == "web_search" :
                search_query = call.args["query"]
                search_results = web_search_client.models.generate_content(
                                    model="gemini-2.5-pro",
                                    contents=search_query,
                                    config=types.GenerateContentConfig(
                                        system_instruction="You are a web search agent. Provide raw, concise and relevant information based on the query.",
                                        tools=[
                                            types.Tool(google_search=types.GoogleSearch()),
                                        ]
                                    )).text
                print(search_results)
                rag_history.append(response.candidates[0].content)
                function_response_contents  = types.Part.from_function_response(
                    name=call.name,
                    response={"contents": search_results}
                )
                rag_history.append(
                    function_response_contents
                )
            
            if call.name == "get_ais_summary" :
                schema = get_summary()
                print(schema)
                rag_history.append(response.candidates[0].content)
                function_response_contents  = types.Part.from_function_response(
                    name=call.name,
                    response={"contents": schema}
                )
                rag_history.append(
                    function_response_contents
                )
            if call.name == "get_relevent_data" :
                relevent_data = get_relevent_data(call.args["query"])
                print(relevent_data)
                rag_history.append(response.candidates[0].content)
                function_response_contents  = types.Part.from_function_response(
                    name=call.name,
                    response={"contents": relevent_data}
                )
                rag_history.append(
                    function_response_contents
                )
        response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents = rag_history,
        config=rag_config,
        )

    rag_history.append(
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text=response.text),
            ],
        )
    )

    return jsonify({"response": response.text,"proceed":False})


# Authentication 

@app.route('/signin', methods=['POST'])
def signin():
    global current_user, current_coll
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400
        
        # Find user in database
        user = users_collection.find_one({"username": username})
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            # Return user data as expected by frontend
            user_data = {
                "username": user['username'],
                "name": user.get('name', user['username']),  # Use name if available, fallback to username
                "email": user.get('email', ''),
                "user_id": str(user['_id'])
            }
            current_user = str(user["_id"])
            current_coll = f"User{current_user[:5]}"
            return jsonify({
                "message": "Sign in successful",
                "user": user_data
            }), 200
        else:
            return jsonify({"message": "Invalid username or password"}), 401
            
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    


@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        name = data.get('name')
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')  
        
        if not username or not password or not name:
            return jsonify({"message": "Name, username and password are required"}), 400
        
        existing_user = users_collection.find_one({"username": username})
        if existing_user:
            return jsonify({"message": "Username already exists"}), 409
            
        if email:
            existing_email = users_collection.find_one({"email": email})
            if existing_email:
                return jsonify({"message": "Email already exists"}), 409
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user_doc = {
            "name": name,
            "username": username,
            "password": hashed_password,
            "created_at": datetime.utcnow()
        }
        
        if email:
            user_doc["email"] = email
        
        result = users_collection.insert_one(user_doc)
        
        return jsonify({
            "message": "Account created successfully! Please sign in.",
            "user_id": str(result.inserted_id),
            "username": username
        }), 201
        
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    

@app.route('/update_profile', methods=['POST'])
def update_profile():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"message": "User ID is required"}), 400
        
        profile_data = {k: v for k, v in data.items() if k != 'user_id'}
        
        if not profile_data:
            return jsonify({"message": "No profile data provided"}), 400
        
        from bson import ObjectId
        update_fields = {}
        
        for key, value in profile_data.items():
            update_fields[key] = value
        
        update_fields["updated_at"] = datetime.utcnow()
        
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            return jsonify({"message": "User not found"}), 404
        
        if result.modified_count > 0:
            return jsonify({
                "message": "Profile updated successfully",
                "user_id": user_id,
                "updated_fields": list(profile_data.keys())
            }), 200
        else:
            return jsonify({
                "message": "No changes made to profile",
                "user_id": user_id
            }), 200
            
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    


if __name__ == '__main__':
    app.run(debug=False,port=3500)