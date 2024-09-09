<script lang="ts">
  import Dialog, { Title, Content } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import Select, { Option } from '@smui/select';
  import Textfield, { HelperLine } from '@smui/textfield';
  import { APIClient, type ProductSpecDTO, type PurchaseOrderDTO } from '$lib/api';
	import { createEventDispatcher } from 'svelte';
  import { z } from 'zod';

  const dispatch = createEventDispatcher();
  let client = new APIClient();
  let is_open = false;
  let catalog: ProductSpecDTO[] = [];
  let errors: Record<string, string[]> = {};

  let formSchema = z.object({
    product_id: z.number().min(1, '产品型号不能为空'),
    quantity: z.number().min(1, '采购数量不能小于1'),
    eta: z.string().date('日期格式错误'),
    supplier_rep: z.string().min(1, '供应商代表不能为空'),
    purchase_rep: z.string().min(1, '采购代表不能为空'),
  });

  let formData = {
    product_id: null,
    quantity: 0,
    eta: '',
    order_time: '',
    supplier_rep: '',
    purchase_rep: '',
  };

  export function open(catalogList: ProductSpecDTO[]) {
    is_open = true;
    catalog = catalogList;
  }

  async function submit() {
    formData.order_time = new Date().toISOString();
    if (formData.eta) {
      formData.eta = new Date(formData.eta).toISOString().split('T')[0];
    }
    console.log(formData);
    const validatedParams = formSchema.safeParse(formData);
    if (!validatedParams.success) {
      errors = validatedParams.error.flatten().fieldErrors;
      return;
    }
    const result = await client.addProductPurchaseOrder(validatedParams.data);
    if (result.success) {
      dispatch('success');
      is_open = false;
    } else {
      errors = result.errors;
    }
  }
</script>


<Dialog
  bind:open={is_open}
  aria-labelledby="default-focus-title"
  aria-describedby="default-focus-content"
>
  <Title id="default-focus-title">添加产品采购订单</Title>
  <Content id="default-focus-content">
    <Select
      style="width: 500px"
      bind:value={formData.product_id}
      label="产品型号"
      required
    >
      {#each catalog as item}
        <Option value={item.product_id}>
          {item.model_no} 
          ({item.category} - {item.product_name} - {item.spec} - {item.manufacturer})
        </Option>
      {/each}
    </Select>

    <Textfield
      style="width: 100px"
      helperLine$style="width: 100%;"
      bind:value={formData.quantity}
      label="采购数量"
      type="number"
      required
      invalid={!!errors.quantity}
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.quantity || ""}</span>
      </HelperLine>
    </Textfield>
    <Textfield
      style="width: 200px"
      bind:value={formData.eta}
      label="预计到货日期"
      type="date"
      required
      invalid={!!errors.eta}
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.eta || ""}</span>
      </HelperLine>
    </Textfield>
    <Textfield
      style="width: 100%"
      bind:value={formData.purchase_rep}
      label="采购代表"
      required
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.purchase_rep || ""}</span>
      </HelperLine>
    </Textfield>
    <Textfield
      style="width: 100%;"
      helperLine$style="width: 100%;"
      bind:value={formData.supplier_rep}
      label="供应商代表"
      required
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.supplier_rep || ""}</span>
      </HelperLine>
    </Textfield>

    <div class="flex justify-end mt-4">
      <Button on:click={submit} >
        <Label>提交</Label>
      </Button>
      <Button on:click={() => {
        formData = {
          product_id: null,
          quantity: 0,
          eta: '',
          order_time: '',
          supplier_rep: '',
          purchase_rep: '',
        };
        is_open = false;
      }} >
        <Label>取消</Label>
      </Button>
    </div>
  </Content>
</Dialog>
