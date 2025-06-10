import sampleData from "@/db/sample-data";
import ProductList from "@/components/product/product-list";

const HomePage = () => {
  return ( 
    <div>
      <ProductList data={sampleData.products} title='Newest Arrivals' limit={4}/>
    </div>
  );
}

export default HomePage;