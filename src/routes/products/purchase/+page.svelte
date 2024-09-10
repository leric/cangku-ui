<script lang="ts">
  import Button, { Label } from '@smui/button';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import { APIClient, type PurchaseOrderDTO, type ProductSpecDTO } from '$lib/api';
	import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import PurchaseOrderFormDialog from './purchase_order_form.svelte';

  let client = new APIClient();

  $: pid = $page.url.searchParams.get('pid') || 0;
  $: {
    console.log('pid', pid);
    loadData();
  }
  let purchaseOrders: PurchaseOrderDTO[] = [];
  let catalogMap: Record<number, ProductSpecDTO> = {};
  let purchaseOrderForm: PurchaseOrderFormDialog;
  
  onMount(() => {
    client.queryProductSpec('', 1, 1000).then((json) => {
      const catalog: ProductSpecDTO[] = json;
      catalogMap = catalog.reduce((acc, item) => {
        acc[item.product_id!] = item;
        return acc;
      }, {} as Record<number, ProductSpecDTO>);
    });
    loadData();
  });

  function loadData() {
    client.queryProductPurchaseOrder(+pid, null, 1, 1000).then((json) => {
      purchaseOrders = json.data;
    });
  }

  async function deletePurchaseOrder(order_no: string) {
    const result = await client.deleteProductPurchaseOrder(order_no);
    if (result.success) {
      loadData();
    } else {
      alert(result.errors);
    }
  }
</script>

<div>
  <div class="flex justify-between mb-4">
    <div>
      <Button href="/products/summary" variant="text">
        <Label>产品库存概览</Label>
      </Button>
      <span class="text-gray-500">/</span>
      <Button variant="text" href="/products/purchase">
        <Label>采购订单列表</Label>
      </Button>
      {#if pid && catalogMap[+pid] }
      <span class="text-gray-500">/</span>
        <Button variant="text">
          <Label>{catalogMap[+pid]?.category}
            - {catalogMap[+pid]?.product_name}
            - {catalogMap[+pid]?.spec} 
            - {catalogMap[+pid]?.manufacturer}
          </Label>
        </Button>
      {/if}
    </div>
    <div class="float-right">
      <Button on:click={() => (purchaseOrderForm.open(Object.values(catalogMap)))} variant="raised">
        <Label>添加采购订单</Label>
      </Button>
    </div>
  </div>

  <DataTable table$aria-label="Purchase Order List" style="width: 100%;">
    <Head>
      <Row>
        <Cell>产品型号</Cell>
        <Cell>订单号</Cell>
        <Cell>下单日期</Cell>
        <Cell>预计到货日期/实际交付日期</Cell>
        <Cell>供应商代表</Cell>
        <Cell>采购代表</Cell>
        <Cell>采购数量/交付数量</Cell>
        <Cell>操作</Cell>
      </Row>
    </Head>
    <Body>
      {#each purchaseOrders as item (item.order_no)}
        <Row>
          <Cell>
            <Wrapper>
              <Button href={`/products/purchase?pid=${item.product_id}`}>
                {catalogMap[item.product_id]?.model_no}
              </Button>
              <Tooltip>
                {catalogMap[item.product_id]?.category}
                 - {catalogMap[item.product_id]?.product_name}
                 - {catalogMap[item.product_id]?.spec} 
                 - {catalogMap[item.product_id]?.manufacturer}
              </Tooltip>
            </Wrapper>
          </Cell>
          <Cell>
            {item.order_no}
            {#if item.status === 'shipped'}
              <span aria-label="shipped" class="shipped">已完成</span>
            {/if}
          </Cell>
          <Cell>{item.order_time}</Cell>
          <Cell>{item.eta} / {item.fulfill_time}</Cell>
          <Cell>{item.supplier_rep}</Cell>
          <Cell>{item.purchase_rep}</Cell>
          <Cell>{item.ordered_quantity} / {item.shipped_quantity}</Cell>
          <Cell>
            <Button on:click={() => {deletePurchaseOrder(item.order_no)}}>删除</Button>
          </Cell>
        </Row>
      {:else}
        <Row>
          <Cell colspan={7}>没有数据</Cell>
        </Row>
      {/each}
    </Body>
  </DataTable>
</div>

<PurchaseOrderFormDialog bind:this={purchaseOrderForm} on:success={loadData} />
