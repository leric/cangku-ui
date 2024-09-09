<script lang="ts">
  import { onMount } from 'svelte';
  import DataTable, {
    Head, Body, Row, Cell,
  } from '@smui/data-table';
  import { Label } from '@smui/common';
  import Button, { Label as ButtonLabel } from '@smui/button';
  import { APIClient, type ProductStockSummaryDTO } from '$lib/api';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let client = new APIClient();
  let items: ProductStockSummaryDTO[] = [];
  
  $: searchQuery = $page.url.searchParams.get('q') || '';
  $: pageSize = $page.url.searchParams.get('ps') || 1000;
  $: pageNum = $page.url.searchParams.get('p') || 1;

  onMount(() => {
    loadData();
  });

  function loadData() {
    client.productStockSummary(searchQuery, +pageNum, +pageSize)
      .then((json) => (items = json));
  }

  async function deleteSpec(pid: number) {
    if (confirm('确定删除？')) {
      const result = await client.deleteProductSpec(`${pid}`);
      if (result.success) {
        loadData();
      } else {
        alert(result.errors);
      }
    }
  }
</script>

<div class="flex justify-between mb-4">
  <div>
    <Button href="/products/summary" variant="text">
      <Label>产品库存概览</Label>
    </Button>
  </div>

  <div class="float-right">
    <Button href="/products/create" variant="raised">
      <ButtonLabel>添加类目</ButtonLabel>
    </Button>
  </div>
</div>

<div class="w-full mt-4">
  <DataTable table$aria-label="Product Stock Summary" class="w-full" style="width: 100%;">
    <Head>
      <Row>
        <Cell numeric>型号</Cell>
        <Cell style="width: 50%;">名称</Cell>
        <Cell numeric>库存数</Cell>
        <Cell numeric>采购中</Cell>
        <Cell numeric>已售出(已交付)</Cell>
        <Cell>操作</Cell>
      </Row>
    </Head>
    <Body>
      {#each items as item (item.product_id)}
        <Row>
          <Cell numeric>{item.model_no}</Cell>
          <Cell>{item.category} - {item.product_name} - {item.spec} - {item.manufacturer}</Cell>
          <Cell numeric>{item.stock}</Cell>
          <Cell numeric>
            <Button href="/products/purchase?pid={item.product_id}">
              <Label>{item.incoming}</Label>
            </Button>
          </Cell>
          <Cell numeric>
            <Button href="/products/sale?pid={item.product_id}">
              <Label>{item.sold + item.shipped} ({item.shipped})</Label>
            </Button>
          </Cell>

          <Cell>
            <Button href="/products/{item.product_id}" variant="text">
              <ButtonLabel>明细</ButtonLabel>
            </Button>
            <Button on:click={() => deleteSpec(item.product_id)} variant="text">
              <ButtonLabel>删除</ButtonLabel>
            </Button>
          </Cell>
        </Row>
      {:else}
        <Row>
          <Cell colspan={6}>No data</Cell>
        </Row>
      {/each}
    </Body>
  </DataTable>
</div>
