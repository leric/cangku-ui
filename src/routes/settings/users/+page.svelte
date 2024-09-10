<script lang="ts">
  import { onMount } from "svelte";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import Button, { Label as ButtonLabel } from "@smui/button";
  import { APIClient, type UserDTO } from "$lib/api";
  import { page } from "$app/stores";
  import CreateUserForm from './create_form.svelte';
  import EditUserForm from './edit_form.svelte';

  let client = new APIClient();
  let users: UserDTO[] = [];
  let createUserFormOpen = false;
  let editUserFormOpen = false;
  let editUserForm: EditUserForm;
  let selectedUser: UserDTO | null = null;

  $: searchQuery = $page.url.searchParams.get("q") || "";
  $: pageSize = $page.url.searchParams.get("ps") || 1000;
  $: pageNum = $page.url.searchParams.get("p") || 1;

  onMount(() => {
    loadData();
  });

  function loadData() {
    client
      .getUsers(searchQuery, +pageNum, +pageSize)
      .then((json) => (users = json));
  }

  async function deleteUser(userId: number) {
    if (confirm("确定删除该用户？")) {
      const result = await client.deleteUser(`${userId}`);
      if (result.success) {
        loadData();
      } else {
        alert(result.errors);
      }
    }
  }

  function openCreateUserForm() {
    createUserFormOpen = true;
  }

  function openEditUserForm(user: UserDTO) {
    selectedUser = user;
    editUserForm.open(user);
    editUserFormOpen = true;
  }

  function handleUserCreated() {
    loadData();
  }

  function handleUserUpdated() {
    loadData();
  }
</script>

<svelte:head>
  <title>用户管理 | 设置</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">用户管理</h1>
    <Button on:click={openCreateUserForm} variant="raised">
      <ButtonLabel>添加用户</ButtonLabel>
    </Button>
  </div>

  <div class="w-full mt-4">
    <DataTable table$aria-label="User Management" class="w-full" style="width: 100%;">
      <Head>
        <Row>
          <Cell numeric>ID</Cell>
          <Cell>姓名</Cell>
          <Cell>邮箱</Cell>
          <Cell>角色</Cell>
          <Cell>操作</Cell>
        </Row>
      </Head>
      <Body>
        {#each users as user (user.id)}
          <Row>
            <Cell numeric>{user.id}</Cell>
            <Cell>{user.username}</Cell>
            <Cell>{user.email}</Cell>
            <Cell>{user.role}</Cell>
            <Cell>
              <Button on:click={() => openEditUserForm(user)} variant="text">
                <ButtonLabel>编辑</ButtonLabel>
              </Button>
              <Button on:click={() => deleteUser(user.id)} variant="text">
                <ButtonLabel>删除</ButtonLabel>
              </Button>
            </Cell>
          </Row>
        {:else}
          <Row>
            <Cell colspan={5}>暂无数据</Cell>
          </Row>
        {/each}
      </Body>
    </DataTable>
  </div>
</div>

<CreateUserForm 
  bind:is_open={createUserFormOpen}
  on:success={handleUserCreated}
/>

<EditUserForm 
  bind:this={editUserForm}
  bind:is_open={editUserFormOpen}
  on:success={handleUserUpdated}
/>
