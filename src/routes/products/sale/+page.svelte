<script lang="ts">
  import Button, { Label } from '@smui/button';
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import { APIClient, type SalesOrderDTO, type ProductSpecDTO } from '$lib/api';
	import { onMount } from 'svelte';
  import SalesOrderFormDialog from './sales_order_form.svelte';
  import { page } from '$app/stores';

  let client = new APIClient();

  $: pid = $page.url.searchParams.get('pid') || 0;
  $: {
    console.log('pid', pid);
    loadData();
  }
  let salesOrders: SalesOrderDTO[] = [];
  let salesOrderForm: SalesOrderFormDialog;
  let catalogMap: Record<number, ProductSpecDTO> = {};

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
    client.queryProductSalesOrder(+pid, null, 1, 1000).then((json) => {
      salesOrders = json.data;
    });
  }

  async function deleteSalesOrder(order_no: string) {
    const result = await client.deleteProductSalesOrder(order_no);
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
      <Button variant="text" href="/products/sale">
        <Label>销售订单列表</Label>
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
      <Button on:click={() => (salesOrderForm.open(Object.values(catalogMap)))} variant="raised">
        <Label>添加销售订单</Label>
      </Button>
    </div>
  </div>

  <DataTable table$aria-label="Sales Order List" style="width: 100%;">
    <Head>
      <Row>
        <Cell>商品型号</Cell>
        <Cell>订单号</Cell>
        <Cell>下单日期</Cell>
        <Cell>预计交付日期/实际交付日期</Cell>
        <Cell>客户</Cell>
        <Cell>销售代表</Cell>
        <Cell>销售数量/交付数量</Cell>
        <Cell>操作</Cell>
      </Row>
    </Head>
    <Body>
      {#each salesOrders as item (item.order_no)}
        <Row>
          <Cell>
            <Wrapper>
              <Button href={`/products/sale?pid=${item.product_id}`}>
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
          <Cell>{item.customer_entity} / {item.customer_rep}</Cell>
          <Cell>{item.sales_rep}</Cell>
          <Cell>{item.ordered_quantity} / {item.shipped_quantity}</Cell>
          <Cell>
            <Button on:click={() => {deleteSalesOrder(item.order_no)}}>删除</Button>
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

<SalesOrderFormDialog bind:this={salesOrderForm} on:success={loadData} />
