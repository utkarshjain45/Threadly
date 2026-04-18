package online.threadly.threadly_api_gateway.filter;

import online.threadly.threadly_api_gateway.service.JwtService;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private final JwtService jwtService;

    public  JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().toString();
        if (
                path.startsWith("/api/v1/auth")
                        || path.startsWith("/api/v1/products")
                        || path.startsWith("/oauth2")
                        || path.startsWith("/login")
        ) {
            return chain.filter(exchange);
        }

        String authenticationHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authenticationHeader == null || !authenticationHeader.startsWith("Bearer ")){
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authenticationHeader.substring(7);
        if(!jwtService.validateToken(token)){
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String userId = jwtService.extractUserId(token);

        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(builder -> {
                    builder.headers(httpHeaders -> {
                        httpHeaders.remove("X-USER-ID");
                        if (userId != null) {
                            httpHeaders.add("X-USER-ID", userId);
                        }
                    });
                })
                .build();

        return chain.filter(mutatedExchange);
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
