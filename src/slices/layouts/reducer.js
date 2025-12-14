import { createSlice } from "@reduxjs/toolkit";
//constants
import {
  layoutTypes,
  leftSidebarTypes,
  layoutModeTypes,
  layoutWidthTypes,
  layoutPositionTypes,
  topbarThemeTypes,
  leftsidbarSizeTypes,
  leftSidebarViewTypes,
  leftSidebarImageTypes,
  preloaderTypes,
  sidebarVisibilitytypes,
} from "../../Components/constants/layout";

export const initialState = {
  layoutType: layoutTypes.VERTICAL,
  leftSidebarType: leftSidebarTypes.DARK,
  layoutModeType: layoutModeTypes.LIGHTMODE,
  layoutWidthType: layoutWidthTypes.FLUID,
  layoutPositionType: layoutPositionTypes.FIXED,
  topbarThemeType: topbarThemeTypes.LIGHT,
  leftsidbarSizeType: leftsidbarSizeTypes.DEFAULT,
  leftSidebarViewType: leftSidebarViewTypes.DEFAULT,
  leftSidebarImageType: leftSidebarImageTypes.NONE,
  preloader: preloaderTypes.DISABLE,
  sidebarVisibilitytype: sidebarVisibilitytypes.SHOW,
  currentRouterState: false,
  formStatus: {
    isFormChanged: false,
    isShowModal: false,
  },
  navigationEditForm: {
    isEditMode: false,
    currentFormValue: null,
    editFormValue: null,
  },
};

const LayoutSlice = createSlice({
  name: "LayoutSlice",
  initialState,
  reducers: {
    changeLayoutAction(state, action) {
      state.layoutType = action.payload;
    },
    changeLayoutModeAction(state, action) {
      state.layoutModeType = action.payload;
    },
    changeSidebarThemeAction(state, action) {
      state.leftSidebarType = action.payload;
    },
    changeLayoutWidthAction(state, action) {
      state.layoutWidthType = action.payload;
    },
    changeLayoutPositionAction(state, action) {
      state.layoutPositionType = action.payload;
    },
    changeTopbarThemeAction(state, action) {
      state.topbarThemeType = action.payload;
    },
    changeLeftsidebarSizeTypeAction(state, action) {
      state.leftsidbarSizeType = action.payload;
    },
    changeLeftsidebarViewTypeAction(state, action) {
      state.leftSidebarViewType = action.payload;
    },
    changeSidebarImageTypeAction(state, action) {
      state.leftSidebarImageType = action.payload;
    },
    changePreLoaderAction(state, action) {
      state.preloader = action.payload;
    },
    changeSidebarVisibilityAction(state, action) {
      state.sidebarVisibilitytype = action.payload;
    },
    resetCurrentRouterStateAction(state, action) {
      state.currentRouterState = action.payload;
    },
    updateFormStatusAction(state, action) {
      const { key, value, callback } = action.payload;
      return {
        ...state,
        formStatus: {
          ...state.formStatus,
          [key]: value,
          callback: callback,
        },
      };
    },
    resetFormStatusAction(state, action) {
      return {
        ...state,
        formStatus: {
          isFormChanged: false,
          isShowModal: false,
          callback: null,
        },
      };
    },
    navigationEditFormAction(state, action) {
      const { currentValue, newValue } = action.payload;
      return {
        ...state,
        navigationEditForm: {
          ...state.navigationEditForm,
          isEditMode: true,
          currentFormValue: currentValue,
          editFormValue: newValue,
        },
      };
    },
    resetNavigationEditFormAction(state, action) {
      return {
        ...state,
        navigationEditForm: {
          isEditMode: false,
          currentFormValue: null,
          editFormValue: null,
        },
      };
    },
  },
});

export const {
  changeLayoutAction,
  changeLayoutModeAction,
  changeSidebarThemeAction,
  changeLayoutWidthAction,
  changeLayoutPositionAction,
  changeTopbarThemeAction,
  changeLeftsidebarSizeTypeAction,
  changeLeftsidebarViewTypeAction,
  changeSidebarImageTypeAction,
  changePreLoaderAction,
  changeSidebarVisibilityAction,
  resetCurrentRouterStateAction,
  updateFormStatusAction,
  resetFormStatusAction,
  navigationEditFormAction,
  resetNavigationEditFormAction,
} = LayoutSlice.actions;

export default LayoutSlice.reducer;
