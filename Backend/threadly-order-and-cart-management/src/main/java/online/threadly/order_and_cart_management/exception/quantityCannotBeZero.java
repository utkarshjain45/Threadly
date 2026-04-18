package online.threadly.order_and_cart_management.exception;

public class quantityCannotBeZero extends RuntimeException{

    public quantityCannotBeZero(String message){
        super(message);
    }
}
