import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orderId: "",
    customerName: "",
    customerPhone: "",
    guests: 0,
    guestMode: "unknown",
    tableNo: "",
    tableIds: [],
    editMode: false
}

const customerSlice = createSlice({
    name: "customer",
    initialState,
    reducers: {
        setCustomer: (state, action) => {
            const {name, phone, guests, guestMode} = action.payload;
            state.orderId = "";
            state.customerName = name;
            state.customerPhone = phone;
            state.guests = guests;
            state.guestMode = guestMode ?? state.guestMode;
            state.tableNo = "";
            state.tableIds = [];
            state.editMode = false;
        },

        removeCustomer: (state) => {
            state.orderId = "";
            state.customerName = "";
            state.customerPhone = "";
            state.guests = 0;
            state.guestMode = "unknown";
            state.tableNo = "";
            state.tableIds = [];
            state.editMode = false;
        },

        setOrderId: (state, action) => {
            state.orderId = action.payload.orderId;
        },

        setEditMode: (state, action) => {
            state.editMode = Boolean(action.payload.editMode);
        },

        updateTable: (state, action) => {
            state.tableNo = action.payload.tableNo;
            state.tableIds = action.payload.tableIds ?? [];
        },

        updateGuests: (state, action) => {
            state.guests = action.payload.guests;
        },

        updateGuestMode: (state, action) => {
            state.guestMode = action.payload.guestMode;
        }
    }
})

export const {setCustomer, removeCustomer, setOrderId, setEditMode, updateTable, updateGuests, updateGuestMode} = customerSlice.actions;
export default customerSlice.reducer;
