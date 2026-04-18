package online.threadly.product.controller;

import online.threadly.product.dao.Response;
import online.threadly.product.model.Product;
import online.threadly.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @PostMapping("/products")
    public ResponseEntity<List<Product>> createProducts(@RequestBody Product[] product){
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProducts(product));
    }

    @PostMapping("/admin/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product){
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(product));
    }

    @DeleteMapping("/products/id/{id}")
    public Product deleteProductById(@PathVariable UUID id){
        return productService.deleteProductById(id);
    }

    @GetMapping("/products")
    public ResponseEntity<Response> getProducts(){
        var product = productService.getProducts();
        if (product.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new Response("Product List is Empty", null));
        }
        return ResponseEntity.ok(new Response("products fetched successfully", product));
    }

    @GetMapping("/products/id/{id}")
    public ResponseEntity<Response> getProductsById(@PathVariable UUID id){
        Product product = productService.getProductById(id);
        if (product == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new Response("product does not exist", null));
        }
        return ResponseEntity.ok(new Response("product fetched successfully", product));
    }

    @GetMapping("/products/slug/{slug}")
    public ResponseEntity<Response> getProducts(@PathVariable String slug){
        Product product = productService.getProductBySlug(slug);
        if (product == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new Response("product not found", null));
        }
        return ResponseEntity.ok(new Response("product fetched successfully", product));
    }

    @PostMapping("/products/bulk")
    public ResponseEntity<List<Product>> getProductsById(@RequestBody List<UUID> productIds){
        try {
            List<Product> products = productService.getProductsByProductIds(productIds);
                return ResponseEntity.ok(products);
        } catch (RuntimeException e) {
            throw new RuntimeException("Products Not Found");
        }
    }
}
