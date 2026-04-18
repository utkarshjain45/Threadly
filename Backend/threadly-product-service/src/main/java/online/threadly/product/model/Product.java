package online.threadly.product.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "products")
public class Product {

    @Id
    private UUID id;

    private String name;

    private String slug;

    private String[] images;

    private  String brand;

    private String description;

    private Integer stock;

    private Double price;

    private Double rating;

    private Integer ratingCount;

    private boolean isFeatured;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate(){
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
    }
}
