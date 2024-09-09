<script lang="ts">
  import "../app.css";
  import TopAppBar, {
    Row, Section, Title as TopBarTitle, AutoAdjust,
  } from '@smui/top-app-bar';
  import Button, { Label } from '@smui/button';
  import Menu from '@smui/menu';
  import List, { Item, Text } from '@smui/list';
  import { auth, tokenStore } from '$lib/auth';
  import { derived } from 'svelte/store';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let topAppBar: TopAppBar;
  let userMenuOpen = false;
  let productMenuOpen = false;
  let materialMenuOpen = false;
  let settingMenuOpen = false;

  // Create a derived store that updates when the token changes
  const isLoggedIn = derived(tokenStore, ($token, set) => {
    set(!!$token);
  });

  onMount(() => {
    // Initialize the token from localStorage if it exists
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      tokenStore.set(storedToken);
    }
  });

  function handleLogout() {
    auth.logout();
    userMenuOpen = false;
    goto('/');
  }

  function handleLogin() {
    auth.requireAuth(window.location.pathname);
  }

  function handleNavigation(path: string) {
    goto(path);
    productMenuOpen = false;
    materialMenuOpen = false;
    settingMenuOpen = false;
  }
</script>

<TopAppBar bind:this={topAppBar} variant="standard" dense>
  <Row>
    <Section>
      <TopBarTitle>仓库管理系统</TopBarTitle>
    </Section>
    <Section>
      <div class="menu-container">
        <Button on:click={() => (productMenuOpen = !productMenuOpen)}>
          <i class="material-icons">store</i>
          <Label>产品库存</Label>
        </Button>
        <Menu bind:open={productMenuOpen} anchorCorner="BOTTOM_LEFT">
          <List>
            <Item on:SMUI:action={() => handleNavigation('/products/summary')}>
              <Text>库存概览</Text>
            </Item>
            <Item on:SMUI:action={() => handleNavigation('/products/purchase')}>
              <Text>采购订单</Text>
            </Item>
            <Item on:SMUI:action={() => handleNavigation('/products/sale')}>
              <Text>销售订单</Text>
            </Item>
          </List>
        </Menu>
      </div>
      <div class="menu-container">
        <Button on:click={() => (materialMenuOpen = !materialMenuOpen)}>
          <i class="material-icons">build</i>
          <Label>物料库存</Label>
        </Button>
        <Menu bind:open={materialMenuOpen} anchorCorner="BOTTOM_LEFT">
          <List>
            <Item on:SMUI:action={() => handleNavigation('/materials/summary')}>
              <Text>库存概览</Text>
            </Item>
            <Item on:SMUI:action={() => handleNavigation('/materials/consume')}>
              <Text>物料消耗</Text>
            </Item>
            <Item on:SMUI:action={() => handleNavigation('/materials/purchase')}>
              <Text>采购计划</Text>
            </Item>
          </List>
        </Menu>
      </div>
      <div class="menu-container">
        <Button on:click={() => (settingMenuOpen = !settingMenuOpen)}>
          <i class="material-icons">settings</i>
          <Label>系统设置</Label>
        </Button>
        <Menu bind:open={settingMenuOpen} anchorCorner="BOTTOM_LEFT">
          <List>
            <Item on:SMUI:action={() => handleNavigation('/settings/users')}>
              <Text>用户管理</Text>
            </Item>
          </List>
        </Menu>
      </div>
    </Section>
    <Section align="end" toolbar>
      {#if $isLoggedIn}
        <div class="menu-container">
          <Button on:click={() => (userMenuOpen = !userMenuOpen)}>
            <i class="material-icons">person</i>
            <Label>用户</Label>
          </Button>
          <Menu bind:open={userMenuOpen} anchorCorner="BOTTOM_LEFT">
            <List>
              <Item on:SMUI:action={() => goto('/account')}>
                <Text>账户设置</Text>
              </Item>
              <Item on:SMUI:action={handleLogout}>
                <Text>退出登录</Text>
              </Item>
            </List>
          </Menu>
        </div>
      {:else}
        <Button on:click={handleLogin}>
          <i class="material-icons">exit_to_app</i>
          <Label>登录</Label>
        </Button>
      {/if}
    </Section>
  </Row>
</TopAppBar>
<AutoAdjust {topAppBar}>
  <main class="container mx-auto p-4">
    <slot></slot>
  </main>
</AutoAdjust>

<style>
  .menu-container {
    position: relative;
    display: inline-block;
    margin-right: 8px;
  }

  :global(#smui-app),
  :global(body),
  :global(html) {
    display: block !important;
    height: auto !important;
    width: auto !important;
    position: static !important;
    margin: 0 !important;
  }

  :global(.mdc-button) {
    text-transform: none;
  }
</style>
