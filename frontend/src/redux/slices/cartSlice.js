import {createSlice} from '@reduxjs/toolkit';

const initialState = {};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem : (state, action) => {
            const item = action.payload;
            const exist = state[item.id];
            if (exist) {
                state[item.id].quantity += 1;
                return;
            }
            state[item.id] = {...item, quantity: 1};
        },

        removeItem: (state, action) => {
            const item = action.payload;
            const exist = state[item.id];
            if (exist) {
                if (state[item.id].quantity > 1) {
                    state[item.id].quantity -= 1;
                } else {
                    delete state[item.id];
                }
            }
        },

        removeItemAll: (state, action) => {
            const item = action.payload;
            const exist = state[item.id];
            if (exist) {
                delete state[item.id];
            }
        }
    }
})

export const {addItem, removeItem, removeItemAll} = cartSlice.actions;
export default cartSlice.reducer;