<script lang="ts">
  import { page } from '$app/stores';
  import _ from 'lodash';
  import Dialog, { Title, Content } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import Textfield, { HelperLine } from '@smui/textfield';
  import Autocomplete from '@smui-extra/autocomplete';
  import Chip, { Set, TrailingAction, Text } from '@smui/chips';
  import { APIClient, type SalesOrderDTO, type ProductStockDetailDTO } from '$lib/api';
	import { createEventDispatcher } from 'svelte';
  import { z } from 'zod';
  

  const formSchema = z.object({
    product_id: z.number(),
    sn_list: z.array(z.string()).min(1, { message: '请选择出库产品序列号' }),
    order_no: z.optional(z.string()),
    deliver_method: z.string().min(1, { message: '请填写发货方式' }),
    deliver_order: z.string().min(1, { message: '请填写发货单号' }),
    deliver_time: z.string().min(1, { message: '请选择发货时间' }),
  });

	const dispatch = createEventDispatcher();
  let client = new APIClient();
  let pid = $page.params.pid;
  export let is_open = false;

  let salesOrders: SalesOrderDTO[] = [];
  let stockProducts: ProductStockDetailDTO[] = [];
  $: unusedProducts = stockProducts.filter((product) => !sn_list.includes(product.serial_no));
  let selected_serial_no = '';
  let sn_list: string[] = [];
  let order_no: SalesOrderDTO | null = null;
  let errors: Record<string, string[]> = {};
  let delivery = {
    method: '',
    order_no: '',
    time: new Date().toISOString().split('T')[0],
  };

  export function open() {
    client.queryProductSalesOrder(+pid, 'ordered', 1, 1000).then((json) => {
      salesOrders = json.data;
    });
    client.queryProductStockDetail(+pid, 'in_stock', 1, 1000).then((json) => {
      stockProducts = json.data;
    });
    is_open = true;
  }

  async function submit() {
    const params = {
      product_id: +pid,
      sn_list: sn_list,
      order_no: order_no ? order_no.order_no : '',
      deliver_method: delivery.method,
      deliver_order: delivery.order_no,
      deliver_time: delivery.time,
    };
    const validatedParams = formSchema.safeParse(params);
    if (!validatedParams.success) {
      console.log(validatedParams.error.flatten().fieldErrors);
      errors = validatedParams.error.flatten().fieldErrors as Record<string, string[]>;
      return;
    }

    const result = await client.productDelivery(validatedParams.data);
    if (result.success) {
      sn_list = [];
      order_no = null;
      delivery = {
        method: '',
        order_no: '',
        time: new Date().toISOString().split('T')[0],
      };
      errors = {};
      is_open = false;
      dispatch('success', {});
    } else {
      console.error('Error in productDelivery:', result.errors);
      errors = result.errors;
    }
  }
</script>


<Dialog
  bind:open={is_open}
  aria-labelledby="default-focus-title"
  aria-describedby="default-focus-content"
>
  <Title id="default-focus-title">产品出库</Title>
  <Content id="default-focus-content">
    <Autocomplete
      options={salesOrders} 
      getOptionLabel={(option) =>
        option ? `${option.order_no}` : ''}
      bind:value={order_no} 
      label="销售订单"
      style="width: 100%;"
    />

    <Autocomplete
      bind:options={unusedProducts} 
      getOptionLabel={(option) =>
        option ? `${option.serial_no}` : ''}
      label="选择产品序列号"
      style="width: 100%;"
      bind:value={selected_serial_no}
      on:SMUIAutocomplete:selected={(e) => {
        e.preventDefault();
        sn_list.push(e.detail.serial_no);
        sn_list = _.uniq(sn_list);
        selected_serial_no = '';
      }}
    />
    <Set bind:chips={sn_list} let:chip>
      <Chip {chip}>
        <Text>{chip}</Text>
        <TrailingAction icon$class="material-icons">cancel</TrailingAction>
      </Chip>
    </Set>
    {#if errors.sn_list }
      <div class="text-red-500">{errors.sn_list}</div>
    {/if}

    <Textfield
      bind:value={delivery.method}
      label="发货方式"
      style="width: 100%;"
      required
      invalid={!!errors.deliver_method}
    >
      <HelperLine slot="helper">
        {#if errors.deliver_method}
          <span class="text-red-500">{errors.deliver_method}</span>
        {/if}
      </HelperLine>
    </Textfield>
    <Textfield
      bind:value={delivery.order_no}
      label="发货单号"
      style="width: 100%;"
      required
      invalid={!!errors.deliver_order}
    >
      <HelperLine slot="helper">
        {#if errors.deliver_order}
          <span class="text-red-500">{errors.deliver_order}</span>
        {/if}
      </HelperLine>
    </Textfield>
    <Textfield
      bind:value={delivery.time}
      label="发货时间"
      style="width: 100%;"
      type="date"
      required
      invalid={!!errors.deliver_time}
    >
      <HelperLine slot="helper">
        {#if errors.deliver_time}
          <span class="text-red-500">{errors.deliver_time}</span>
        {/if}
      </HelperLine>
    </Textfield>
    <div class="flex justify-end mt-4">
      <Button on:click={submit} >
        <Label>提交</Label>
      </Button>
      <Button defaultAction on:click={() => {
        errors = {};
        order_no = null;
        sn_list = [];
        selected_serial_no = '';
        delivery = {
          method: '',
          order_no: '',
          time: new Date().toISOString().split('T')[0],
        };
        is_open = false;
      }} >
        <Label>取消</Label>
      </Button>
    </div>
  </Content>
</Dialog>
