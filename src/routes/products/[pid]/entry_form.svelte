<script lang="ts">
  import { page } from '$app/stores';
  import Dialog, { Title, Content } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import Textfield, { HelperLine } from '@smui/textfield';
  import Autocomplete from '@smui-extra/autocomplete';
  import { APIClient, type PurchaseOrderDTO } from '$lib/api';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
  let client = new APIClient();
  let pid = $page.params.pid;
  export let is_open = false;

  let purchaseOrders: PurchaseOrderDTO[] = [];
  let order_no: PurchaseOrderDTO | null = null;
  let sn_list: string = '';
  let errors: Record<string, string[]> = {};

  export function open() {
    client.queryProductPurchaseOrder(+pid, 'ordered', 1, 1000).then((json) => {
      purchaseOrders = json.data;
    });
    is_open = true;
  }

  async function submit() {
    if (sn_list.length === 0) {
      errors.sn_list = ['请输入产品序列号'];
      return;
    }
    const result = await client.productEntryStock({
      product_id: pid,
      sn_list: sn_list.split('\n').map((sn) => sn.trim()),
      order_no: order_no ? order_no.order_no : '',
    });
    if (result.success) {
      sn_list = '';
      order_no = null;
      errors = {};
      is_open = false;
      dispatch('success', {});
    } else {
      console.log(result);
      errors = result.errors;
    }
  }
</script>


<Dialog
  bind:open={is_open}
  aria-labelledby="default-focus-title"
  aria-describedby="default-focus-content"
>
  <Title id="default-focus-title">产品入库</Title>
  <Content id="default-focus-content">
    <Autocomplete
      options={purchaseOrders} 
      getOptionLabel={(option) =>
        option ? `${option.order_no}` : ''}
      bind:value={order_no} 
      label="采购订单"
      style="width: 100%;"
    />
    <Textfield
      style="width: 400px; margin-top: 1rem;"
      helperLine$style="width: 100%;"
      textarea
      bind:value={sn_list}
      label="产品序列号"
      required
      invalid={!!errors.sn_list}
    >
      <HelperLine slot="helper">
        {#if errors.sn_list}
          <span class="text-red-500">{errors.sn_list}</span>
        {:else}
          <span class="text-gray-500">每行一个产品序列号</span>
        {/if}
      </HelperLine>
    </Textfield>
    <div class="flex justify-end mt-4">
      <Button on:click={submit} >
        <Label>提交</Label>
      </Button>
      <Button defaultAction on:click={() => {
        sn_list = '';
        order_no = null;
        errors = {};
        is_open = false;
      }} >
        <Label>取消</Label>
      </Button>
    </div>
  </Content>
</Dialog>
