package online.threadly.threadly_api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

@SpringBootApplication
@EnableDiscoveryClient
public class ThreadlyApiGatewayApplication {

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(ThreadlyApiGatewayApplication.class, args);
	}

	private static void loadEnv() {
		File currentDir = new File(".").getAbsoluteFile();
		while (currentDir != null) {
			File envFile = new File(currentDir, ".env");
			if (envFile.exists() && envFile.isFile()) {
				parseAndSetEnv(envFile);
			}
			File serviceEnv = new File(currentDir, "threadly-api-gateway/.env");
			if (serviceEnv.exists() && serviceEnv.isFile()) {
				parseAndSetEnv(serviceEnv);
			}
			File backendServiceEnv = new File(currentDir, "Backend/threadly-api-gateway/.env");
			if (backendServiceEnv.exists() && backendServiceEnv.isFile()) {
				parseAndSetEnv(backendServiceEnv);
			}
			currentDir = currentDir.getParentFile();
		}
	}

	private static void parseAndSetEnv(File file) {
		try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
			String line;
			while ((line = reader.readLine()) != null) {
				line = line.trim();
				if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
					continue;
				}
				int eqIdx = line.indexOf('=');
				String key = line.substring(0, eqIdx).trim();
				String value = line.substring(eqIdx + 1).trim();

				if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
					value = value.substring(1, value.length() - 1);
				} else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
					value = value.substring(1, value.length() - 1);
				}

				System.setProperty(key, value);
				System.setProperty(key.toLowerCase().replace('_', '.'), value);
			}
		} catch (Exception ignored) {}
	}

}
