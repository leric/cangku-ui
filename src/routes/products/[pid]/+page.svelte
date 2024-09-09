<script lang="ts">
  import { page } from '$app/stores';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import Button, { Label } from '@smui/button';
  import { APIClient, type ProductSpecDTO, type ProductStockDetailDTO } from '$lib/api';
  import { onMount } from 'svelte';
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import ProductEntryDialog from './entry_form.svelte';
  import ProductDeliverDialog from './deliver_form.svelte';
  import ProductCustomizeDialog from './customize_form.svelte';

  let client = new APIClient();
  let pid = $page.params.pid;
  let spec: ProductSpecDTO = {
    model_no: '',
    category: '',
    product_name: '',
    spec: '',
    manufacturer: '',
  };

  let entryDialog: ProductEntryDialog;
  let deliverDialog: ProductDeliverDialog;
  let customizeDialog: ProductCustomizeDialog;
  let details: ProductStockDetailDTO[] = [];

  function loadData() {
    client.queryProductStockDetail(+pid, null, 1, 1000).then((json) => {
      details = json.data;
    });
  }

  onMount(() => {
    client.getProductSpec(pid).then((json) => {
      spec = json;
    });
    loadData();
  })

  async function handleDelete(pid: number, sn: string) {
    if (confirm("确定删除该产品？")) {
      await client.deleteProductStock(pid, sn);
      loadData();
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
      <Button variant="text">
        <Label>{spec.category} | {spec.product_name} | {spec.spec} | {spec.manufacturer}</Label>
    </Button>
    </div>

    <div class="float-right">
      <Button on:click={() => (entryDialog.open())} variant="raised">
        <Label>产品入库</Label>
      </Button>
      <Button on:click={() => (deliverDialog.open())} variant="raised">
        <Label>产品出库</Label>
      </Button>
    </div>
  </div>
  
  <DataTable table$aria-label="Product Stock List" style="width: 100%;">
    <Head>
      <Row>
        <Cell numeric>ID</Cell>
        <Cell>产品序列号</Cell>
        <Cell>入库时间</Cell>
        <Cell>采购订单</Cell>
        <Cell>销售订单</Cell>
        <Cell>定制记录</Cell>
        <Cell>发货记录</Cell>
        <Cell>操作</Cell>
      </Row>
    </Head>
    <Body>
      {#each details as item (item.id)}
        <Row>
          <Cell numeric>
            {item.id}
            {#if item.status === 'shipped'}
              <span aria-label="shipped" class="shipped">已交付</span>
            {/if}
          </Cell>
          <Cell>{item.serial_no}</Cell>
          <Cell>{item.entry_time}</Cell>
          <Cell>{item.purchase_order}</Cell>
          <Cell>{item.sale_order}</Cell>
          <Cell>
            {#if item.customized_by}
            <Wrapper>
              <div role="button">
                {item.customized_by}
              </div>
              <Tooltip>{item.customization}</Tooltip>
            </Wrapper>
            {:else}
              -
            {/if}
          </Cell>
          <Cell>{item.deliver_method} / {item.deliver_order} / {item.deliver_time}</Cell>
          <Cell>
            <Button on:click={() => {customizeDialog.open(item.product_id, item.serial_no)}}>定制</Button>
            <Button on:click={() => {handleDelete(item.product_id, item.serial_no)}}>删除</Button>
          </Cell>
        </Row>
      {:else}
        <Row>
          <Cell colspan={8}>没有数据</Cell>
        </Row>
      {/each}
    </Body>
  </DataTable>
</div>

<ProductEntryDialog bind:this={entryDialog} on:success={loadData} />

<ProductDeliverDialog bind:this={deliverDialog} on:success={loadData} />

<ProductCustomizeDialog bind:this={customizeDialog} on:success={loadData} />

<style>
  .shipped {
    background-color: #929292;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
  }
</style>