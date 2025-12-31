import axiosInstance from "@/helpers/axiosInstance";

const getProductReviews = async (productId: string) => {
  const { data } = await axiosInstance.get(
    `/api/reviews/product/${productId}`
  );
  return data;
};

export default getProductReviews;
