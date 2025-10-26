# Taxflow.ai

**Taxflow.ai** is an AI-powered platform that automates income tax filing in India. It extracts data from AIS and Form-16, interacts with users to collect missing information, provides personalized guidance, and generates a ready-to-file ITR JSON compatible with the Income Tax e-filing portal. The platform simplifies a complex, error-prone process, making tax filing fast, accurate, and effortless.

---

## 🚀 Features

- **Smart ITR Detection:** Automatically identifies the suitable ITR form (1–4) based on AIS and Form-16 using LLMs.  
- **Automated Document Parsing:** Extracts income, deductions, and other relevant details from PDFs using PDFPlumber.  
- **Interactive Chat Assistance:** Collects missing information and additional income/expense details, providing personalized suggestions.  
- **Optimal Regime Selection:** Recommends the most tax-efficient option (Old vs New regime) using AI.  
- **Ready-to-File Output:** Generates ITR-compatible JSON ready for manual upload to the Income Tax portal.  
- **User-Friendly Web Interface:** Desktop web application built with React + Vite and Flask backend.  
- **In-Memory Agentic RAG:** Handles document and conversation management efficiently.  

---

## 🎯 Future Enhancements

- 🛡️ **PII Masking:** Protect sensitive user data.  
- 🔒 **Security Enhancements:** Strengthened platform security for safe filing.  
- 🎤 **Voice Support:** Conversational voice input for a smoother experience.  
- 📱 **Mobile App Support:** Access Taxflow.ai anywhere via mobile devices.  

---

## 🏗️ Tech Stack

- **Frontend:** React + Vite  
- **Backend:** Flask  
- **AI/LLM:** Gemini (for parsing, regime selection, and interactive chat)  
- **Document Parsing:** PDFPlumber  
- **Memory & Retrieval:** In-memory Agentic RAG  
- **Data Storage:** JSON for ITR output (compatible with Income Tax portal)  

---

## 📝 How It Works

1. **Upload AIS & Form-16 PDFs**.  
2. **AI parses documents** and generates a temporary ITR.  
3. **Interactive chat collects missing info** and additional income/expenses.  
4. **Optimal ITR form & tax regime selection** by AI.  
5. **Generates ready-to-file ITR JSON**, which the user can manually upload to the e-filing portal.  

---

## ⚡ Benefits

- Saves **time** and reduces manual effort.  
- Ensures **accuracy** and minimizes filing errors.  
- Provides **personalized guidance** and smart suggestions.  
- Reduces dependence on tax consultants, cutting **costs**.  

---

