import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

const partCatalogApi = {
  getMakes: async () => {
    const response = await axiosInstance.get(ENDPOINTS.PART_CATALOG.MAKES);
    return response.data;
  },
  getModels: async (makeId) => {
    const response = await axiosInstance.get(ENDPOINTS.PART_CATALOG.MODELS(makeId));
    return response.data;
  },
  getVariants: async (modelId) => {
    const response = await axiosInstance.get(ENDPOINTS.PART_CATALOG.VARIANTS(modelId));
    return response.data;
  },
  getPartsForVariant: async (variantId) => {
    const response = await axiosInstance.get(ENDPOINTS.PART_CATALOG.VARIANT_PARTS(variantId));
    return response.data;
  },
  getChecklistForVehicle: async (vechileId) => {
    const response = await axiosInstance.get(
      ENDPOINTS.PART_CATALOG.CHECKLIST_VEHICLE(vechileId),
    );
    return response.data;
  },
  getChecklistByMmv: async ({ make, model, variant, vehicleType }) => {
    const response = await axiosInstance.get(ENDPOINTS.PART_CATALOG.CHECKLIST_MMV, {
      params: {
        make,
        model,
        variant: variant || undefined,
        vehicleType: vehicleType || undefined,
      },
    });
    return response.data;
  },
  addPartToVariant: async (variantId, payload) => {
    const response = await axiosInstance.post(
      ENDPOINTS.PART_CATALOG.ADD_VARIANT_PART(variantId),
      payload,
    );
    return response.data;
  },
};

export default partCatalogApi;
