<script lang="ts">
  import { page } from '$app/stores';
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import Textfield, { HelperLine } from '@smui/textfield';
  import { APIClient, type ProductSpecDTO, type PurchaseOrderDTO } from '$lib/api';
	import { createEventDispatcher } from 'svelte';
  import Select, { Option } from '@smui/select';
  import { z } from 'zod';

	const dispatch = createEventDispatcher();
  let client = new APIClient();
  export let is_open = false;
  let catalog: ProductSpecDTO[] = [];
  let errors: Record<string, string[]> = {};

  let formSchema = z.object({
    product_id: z.number(),
    quantity: z.number(),
    eta: z.string(),
    order_time: z.string(),
    customer_entity: z.string(),
    customer_rep: z.string(),
    sales_rep: z.string(),
  });

  let formData = {
    product_id: null,
    quantity: 0,
    eta: '',
    order_time: '',
    customer_entity: '',
    customer_rep: '',
    sales_rep: '',
  };

  export function open(catalogList: ProductSpecDTO[]) {
    is_open = true;
    catalog = catalogList;
  }

  async function submit() {
    formData.order_time = new Date().toISOString();
    const validatedParams = formSchema.safeParse(formData);
    if (!validatedParams.success) {
      errors = validatedParams.error.flatten().fieldErrors;
      return;
    }
    const result = await client.addProductSalesOrder(validatedParams.data)
    if (result.success) {
      dispatch('success');
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
  <Title id="default-focus-title">添加产品销售订单</Title>
  <Content id="default-focus-content">
    <Select
      style="width: 500px"
      bind:value={formData.product_id}
      label="产品型号"
      required
    >
      {#each catalog as item}
        <Option value={item.product_id}>{item.model_no} ({item.category} - {item.product_name} - {item.spec} - {item.manufacturer})</Option>
      {/each}
    </Select>


    <Textfield
      style="width: 100px"
      helperLine$style="width: 100%;"
      bind:value={formData.quantity}
      label="销售数量"
      type="number"
      required
    >
      <HelperLine slot="helper"></HelperLine>
    </Textfield>
    <Textfield
      style="width: 100%"
      bind:value={formData.eta}
      label="预计交付日期"
      type="date"
      required
    >
      <HelperLine slot="helper"></HelperLine>
    </Textfield>
    <Textfield
      style="width: 100%"
      bind:value={formData.sales_rep}
      label="销售"
      required
    >
      <HelperLine slot="helper"></HelperLine>
    </Textfield>
    <Textfield
      style="width: 100%;"
      helperLine$style="width: 100%;"
      bind:value={formData.customer_entity}
      label="客户企业"
      required
    >
      <HelperLine slot="helper"></HelperLine>
    </Textfield>
    <Textfield
      style="width: 100%;"
      helperLine$style="width: 100%;"
      bind:value={formData.customer_rep}
      label="客户代表"
      required
    >
      <HelperLine slot="helper"></HelperLine>
    </Textfield>
  </Content>
  <Actions>
    <Button on:click={submit} >
      <Label>提交</Label>
    </Button>
    <Button defaultAction on:click={() => {
      formData = {
        product_id: null,
        quantity: 0,
        eta: '',
        order_time: '',
        customer_entity: '',
        customer_rep: '',
        sales_rep: '',
      };
      is_open = false;
    }} >
      <Label>取消</Label>
    </Button>
  </Actions>
</Dialog>
