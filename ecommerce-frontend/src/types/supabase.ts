// Stub Supabase Database types
// This file provides type definitions to prevent build errors
// TODO: Replace with actual types from your Node.js backend

export type Database = {
  public: {
    Enums: {
      order_status_enum: string;
      payment_method_enum: string;
    };
    Tables: {
      orders: {
        Row: {
          id: string;
          invoice_no: string;
          masked_order_id?: string;
          order_time: string;
          total_amount: number;
          shipping_cost: number;
          payment_method: string;
          status: string;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
      };
      order_items: {
        Row: {
          id: string;
          quantity: number;
          unit_price: number;
          [key: string]: any;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          cost_price: number;
          selling_price: number;
          stock: number;
          min_stock_threshold: number;
          category_id: string;
          image_url: string;
          slug: string;
          sku: string;
          [key: string]: any;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          [key: string]: any;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          address?: string;
          [key: string]: any;
        };
      };
      coupons: {
        Row: {
          id: string;
          discount_type: string;
          discount_value: number;
          [key: string]: any;
        };
      };
      staff: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          [key: string]: any;
        };
      };
      staff_roles: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          [key: string]: any;
        };
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          image_url: string;
          type: string;
          created_at: string;
          [key: string]: any;
        };
      };
      [key: string]: any;
    };
  };
};

