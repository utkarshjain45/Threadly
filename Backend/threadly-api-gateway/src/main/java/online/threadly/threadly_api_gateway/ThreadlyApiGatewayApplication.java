package online.threadly.threadly_api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@EnableDiscoveryClient
@CrossOrigin
public class ThreadlyApiGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ThreadlyApiGatewayApplication.class, args);
	}

}
