import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("reloop-cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("reloop-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((previous) => {
      const existing = previous.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previous, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;

    setCartItems((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}