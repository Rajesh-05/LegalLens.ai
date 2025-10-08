import Header from '../components/Header'
import Hero from '../components/Hero'
import Features from '../components/Features'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

const Dashboard = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;