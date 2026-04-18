// // features/cart/cartSlice.ts

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface CartItem {
//   id: number;
//   title: string;
//   price: number;
// }

// const cartSlice = createSlice({
//   name: "cart",
//   initialState: [] as CartItem[],
//   reducers: {
//     addToCart: (state, action: PayloadAction<CartItem>) => {
//       state.push(action.payload);
//     },
//   },
// });

// export const { addToCart } = cartSlice.actions;
// export default cartSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: [] as any[],
  reducers: {
    addToCart: (state, action) => {
      const item = state.find((i) => i.id === action.payload.id);

      if (item) {
        item.quantity += 1;
      } else {
        state.push({ ...action.payload, quantity: 1 });
      }
    },

    removeFromCart: (state, action) => {
      return state.filter((i) => i.id !== action.payload);
    },

    updateQty: (state, action) => {
      const item = state.find((i) => i.id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
    },
  },
});

export const { addToCart, removeFromCart, updateQty } = cartSlice.actions;
export default cartSlice.reducer;