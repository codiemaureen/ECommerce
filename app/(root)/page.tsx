import { getLatestProducts, getFeaturedProducts } from "@/lib/action/product.actions";
import ProductList from "@/components/shared/product/product-list";
import ProductCarousel from "@/components/shared/product/product.carousel";
import ViewAllProductsButton from "@/components/view-all-products-button";
import IconBoxes from "@/components/icon-boxes";


const HomePage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();

  return ( 
    <div>
      {featuredProducts.length > 0 && <ProductCarousel data={featuredProducts}/>}
      <ProductList data={latestProducts} title='Newest Arrivals' limit={4}/>
      <ViewAllProductsButton />
      <IconBoxes />
    </div>
  );
}

export default HomePage;