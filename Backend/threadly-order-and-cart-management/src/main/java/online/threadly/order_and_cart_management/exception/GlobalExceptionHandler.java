package online.threadly.order_and_cart_management.exception;

import jakarta.ws.rs.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException badRequestException){
        return buildResponse(HttpStatus.BAD_REQUEST, badRequestException.getMessage());
    }

    @ExceptionHandler(quantityCannotBeZero.class)
    public ResponseEntity<Map<String, Object>> quantityZero(quantityCannotBeZero exception){
        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(BadRequestException badRequestException){
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, badRequestException.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus httpStatus, String message) {
        Map<String, Object> map = new HashMap<>();
        map.put("message", message);
        map.put("timestamp", LocalDateTime.now());
        map.put("status", httpStatus.value());
        map.put("error", httpStatus.getReasonPhrase());
        return new ResponseEntity<>(map, httpStatus);
    }
}
