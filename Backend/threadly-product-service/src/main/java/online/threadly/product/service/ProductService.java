package online.threadly.product.service;

import lombok.AllArgsConstructor;
import online.threadly.product.model.Category;
import online.threadly.product.model.Product;
import online.threadly.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@AllArgsConstructor
@Service
public class ProductService {

    @Autowired
    private final ProductRepository productRepository;

    public List<Product> createProducts(Product[] product){
        Arrays.stream(product).forEach(product1 -> productRepository.save(product1));
        return Arrays.asList(product);
    }

    public Product createProduct(Product product){
        return productRepository.save(product);
    }

    public Product deleteProductById(UUID id){
        Optional<Product> toBeDeleted = productRepository.findById(id);
        productRepository.deleteById(id);
        return toBeDeleted.get();
    }

    public List<Product> getProducts(){
        return productRepository.findAll();
    }

    public Product getProductById(UUID id){
        return productRepository.findById(id).orElse(null);
    }

    public Product getProductBySlug(String slug){
        return productRepository.findBySlug(slug).orElse(null);
    }

    public List<Product> getProductsByCategory(Category category){
        return productRepository.findByCategory(category);
    }

    public List<Product> getBestSellers(){
        return productRepository.findByBestSellerTrue();
    }

    public List<Product> getNewArrivals(){
        return productRepository.findByNewArrivalTrue();
    }

    public List<Product> getProductsByProductIds(List<UUID> productIds){
        try {
            return productRepository.findAllById(productIds);
        } catch (RuntimeException e){
            throw new RuntimeException("No Product exist");
        }
    }
}
