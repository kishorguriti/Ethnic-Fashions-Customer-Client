// import React from "react";
// import { Row, Col, Button, Typography, Space } from "antd";
// import HeroBanner from "../../components/ui/HeroBanner";
// import CategorySection from "../../features/products/components/CategorySection";
// import TrendingProducts from "../../features/products/components/TrendingProducts";
// import FestiveSaleBanner from "../../components/ui/FestiveSaleBanner";

// const { Title, Paragraph } = Typography;

// const Home: React.FC = () => {
//   return (
//     <div className="home-page">
//       {/* Hero Section */}
//       <HeroBanner />

//       <div className="container py-5">
//         {/* Category Selection: Sarees, Churidars, Jewellery */}
//         <CategorySection />

//         {/* Shop by Fabric Icons */}
//         <section className="my-5 text-center">
//           <Title level={3}>Shop by Fabric</Title>
//           <div className="d-flex justify-content-center flex-wrap gap-4 mt-4">
//             {["Silk", "Cotton", "Linen", "Chiffon", "Organza", "Satin"].map(
//               (fabric) => (
//                 <div key={fabric} className="fabric-item text-center">
//                   <div className="fabric-icon-circle shadow-sm mb-2"></div>
//                   <Paragraph>{fabric}</Paragraph>
//                 </div>
//               ),
//             )}
//           </div>
//         </section>

//         {/* Trending Now Section */}
//         <TrendingProducts />
//       </div>

//       {/* Festive Sale Call to Action */}
//       <FestiveSaleBanner />
//     </div>
//   );
// };

// export default Home;

import React from "react";
import Hero from "../../components/ui/HeroBanner";
import CategoryCards from "../../features/products/components/CategorySection";
import FabricFilter from "../../features/products/components/FabricFilter";
import TrendingProducts from "../../features/products/components/TrendingProducts";
import FestiveSale from "../../components/ui/FestiveSaleBanner";
import Newsletter from "../../components/ui/NewsletterSection";
// import Footer from "../../components/layout/customer/Footer";
import Features from "../../components/ui/Features";

const Home: React.FC = () => {
  return (
    <div className={""}>
      {/* 3. Hero Content */}
      <Hero />
      <div className="container py-5">
        <CategoryCards />
      </div>
      <div className="py-5">
        <FabricFilter />
      </div>
      <div className="container py-5">
        <TrendingProducts />
      </div>
      <div>
        <FestiveSale />
      </div>
      <div>
        <Features />
      </div>
      <Newsletter />
      {/* <div>
        <Footer />
      </div> */}
    </div>
  );
};

export default Home;
