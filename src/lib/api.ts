import { auth } from './auth';

export type ProductStockSummaryDTO = {
  product_id: number;
  product_name: string;
  category: string;
  model_no: string;
  spec: string;
  manufacturer: string;
  stock: number;
  incoming: number;
  sold: number;
  shipped: number;
};

export type ProductSpecDTO = {
  product_id?: number;
  model_no: string;
  category: string;
  product_name: string;
  spec: string;
  manufacturer: string;
}

export type ProductStockDetailDTO = {
  id: number;
  product_id: number;
  serial_no: string;
  entry_time: string;
  purchase_order: string;
  sale_order: string;
  customization: string;
  customized_by: string;
  deliver_time: string;
  deliver_method: string;
  deliver_order: string;
  status: string;
};

export type ProductEntryDTO = {
  product_id: number;
  sn_list: string[];
  order_no?: string;
};

export type PurchaseOrderDTO = {
  order_no: string;
  product_id: number;
  order_time: Date;
  eta: Date;
  supplier_rep: string;
  purchase_rep: string;
  fulfill_time: Date | null;
  ordered_quantity: number;
  shipped_quantity: number;
  status: 'ordered' | 'shipped';
};

export type SalesOrderDTO = {
  order_no: string;
  product_id: number;
  order_time: Date;
  eta: Date;
  customer_entity: string;
  customer_rep: string;
  sales_rep: string;
  fulfill_time: Date | null;
  ordered_quantity: number;
  shipped_quantity: number;
  status: 'ordered' | 'shipped';
};

export type Result = {
  success: boolean;
  errors: any;
  data: any;
}


export class APIClient {

  fetch: typeof fetch;
  base: string;

  constructor(base='/api', fetch=globalThis.fetch) {
    this.fetch = fetch;
    this.base = base;
  }

  async fetchAPI(endpoint: string, options: RequestInit = {}, authenticated: boolean = true) {
    const token = auth.getToken();
    console.log(token);
    if (!token) {
      auth.requireAuth(window.location.pathname);
      return {
        success: false,
        errors: 'Unauthorized',
        data: null,
      };
    }
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`
    };
    const resp = await this.fetch(`${this.base}${endpoint}`, options);
    const result = await resp.json();
    if (authenticated && resp.status === 401) {
      auth.requireAuth(window.location.pathname);
      return {
        success: false,
        errors: 'Unauthorized',
        data: null,
      };
    }

    if (!resp.ok) {
      console.log(result);
      return {
        success: false,
        errors: result,
        data: null,
      };
    }
    return {
      data: result,
      success: true,
      errors: null,
    };
  }
  
  // Material API
  async addMaterial(material: any): Promise<Result> {
    return await this.fetchAPI('/materials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(material),
    });
  }
  
  async queryMaterials(keyword: string) {
    const result = await this.fetchAPI(`/materials?keyword=${keyword}`);
    if (result.success) {
      return result.data;
    }
    return [];
  }
  
  async getCategories(): Promise<string[]> {
    const result = await this.fetchAPI('/material/categories');
    if (result.success) {
      return result.data;
    }
    return [];
  }
  
  // Product API
  async addProductSpec(spec: ProductSpecDTO): Promise<Result> {
    return await this.fetchAPI('/product_specs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(spec),
    });
  }
  
  async queryProductSpec(keyword: string, p: number | null = null, ps: number | null = null) {
    const params = new URLSearchParams();
    params.append('keyword', keyword);
    if (p) params.append('p', p.toString());
    if (ps) params.append('ps', ps.toString());
    const result = await this.fetchAPI(`/product_specs?${params.toString()}`);
    if (result.success) {
      return result.data;
    }
    return [];
  }
  
  async deleteProductSpec(id: string) {
    return this.fetchAPI(`/product_spec/${id}`, {
      method: 'DELETE',
    });
  }
  
  async getProductSpec(id: string) {
    const result = await this.fetchAPI(`/product_spec/${id}`, {
      method: 'GET',
    });
    if (result.success) {
      return result.data;
    }
    return null;
  }
  
  async getPropertyEnum(property: string): Promise<string[]> {
    const result = await this.fetchAPI(`/product_specs/property_enum?property=${property}`);
    if (result.success) {
      return result.data;
    }
    return [];
  }
  
  async productEntryStock(entry: any) {
    return await this.fetchAPI('/product_repo/entry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
  }
  
  async productDelivery(deliver: any) {
    return await this.fetchAPI('/product_repo/delivery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deliver),
    });
  }
  
  async addProductPurchaseOrder(entry: any) {
    return await this.fetchAPI('/product_repo/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
  }
  
  async addProductSalesOrder(entry: any): Promise<Result> {
    return await this.fetchAPI('/product_repo/sale', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
  }
  
  async queryProductStockSummary(id: number): Promise<{ total: number; data: ProductStockSummaryDTO[] }> {
    const result = await this.fetchAPI(`/product_repo/${id}/summary`);
    if (result.success) {
      return result.data;
    }
    return { total: 0, data: [] };
  }
  
  async queryProductStockDetail(id: number, status: string | null = null, p: number = 1, ps: number = 10) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('p', p.toString());
    params.append('ps', ps.toString());
    const result = await this.fetchAPI(`/product_repo/${id}/stock?${params.toString()}`);
    if (result.success) {
      return result.data;
    }
    return [];
  }
  
  async queryProductPurchaseOrder(pid: number | null, status: string | null, p: number = 1, ps: number = 10) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (pid) params.append('pid', pid.toString());
    params.append('p', p.toString());
    params.append('ps', ps.toString());
    const result = await this.fetchAPI(`/product_repo/purchase_order?${params.toString()}`);
    if (result.success) {
      return result.data;
    }
    return [];
  }
  
  async queryProductSalesOrder(pid: number | null, status: string | null, p: number = 1, ps: number = 10) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (pid) params.append('pid', pid.toString());
    params.append('p', p.toString());
    params.append('ps', ps.toString());
    const result = await this.fetchAPI(`/product_repo/sales_order?${params.toString()}`);
    if (result.success) {
      return result.data;
    }
    return [];
  }
  
  /**
   * 查询产品列表和库存概要
   * @param p 页码
   * @param ps 每页数量
   * @returns 库存产品信息
   */
  async productStockSummary(keyword: string, p: number = 1, ps: number = 10): Promise<ProductStockSummaryDTO[]> {
    const params = new URLSearchParams();
    
    params.append('p', p.toString());
    params.append('ps', ps.toString());
    const result =   await this.fetchAPI(`/product_repo/summary?${params.toString()}`);
    if (result.success) {
      return result.data;
    }
    return [];
  }

  /**
   * 删除库存产品
   * @param id 库存ID
   * @returns 
   */
  async deleteProductStock(pid: number, sn: string) {
    return await this.fetchAPI(`/product_repo/${pid}/stock/${sn}`, {
      method: 'DELETE',
    });
  }

  /**
   * 查询具体某一个库存产品的信息
   * @param stock_id 库存ID
   * @returns 库存产品信息
   */
  async queryStockProductInfo(pid: number, sn: string) {
    const result = await this.fetchAPI(`/product_repo/${pid}/stock/${sn}`);
    if (result.success) {
      return result.data;
    }
    return {};
  }

  /**
   * 更新库存产品的定制信息
   * @param pid 产品ID
   * @param sn 库存序列号
   * @param customization 定制信息
   * @param customized_by 定制人
   * @returns 
   */
  async updateProductCustomization(pid: number, sn: string, customization: string, customized_by: string) {
    return await this.fetchAPI(`/product_repo/${pid}/stock/${sn}/customize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customization, customized_by }),
    });
  }

  /**
   * 删除采购订单
   * @param order_no 订单号
   * @returns 
   */
  async deleteProductPurchaseOrder(order_no: string): Promise<Result> {
    return await this.fetchAPI(`/product_repo/purchase_order/${order_no}`, {
      method: 'DELETE',
    });
  }

  /**
   * 删除销售订单
   * @param order_no 订单号
   * @returns 
   */
  async deleteProductSalesOrder(order_no: string): Promise<Result> {
    return await this.fetchAPI(`/product_repo/sales_order/${order_no}`, {
      method: 'DELETE',
    });
  }

  async getCurrentUser() {
    const result = await this.fetchAPI('/user/current');
    if (result.success) {
      return result.data;
    }
    return null;
  }
  
  async updateUserName(name: string) {
    return await this.fetchAPI('/user/info', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: name }),
    });
  }

  async updateUserPassword(oldPassword: string, newPassword: string) {
    return await this.fetchAPI('/user/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ current_password: oldPassword, new_password: newPassword }),
    });
  }
}
