<script lang="ts">
  import { onMount } from 'svelte';
  import { z } from 'zod';
  import { APIClient } from '$lib/api';
  import Button, { Label } from '@smui/button';
  import Textfield, { HelperLine } from '@smui/textfield';

  let apiClient = new APIClient();
  let user = { email: '', username: '', role: '' };
  let newName = '';
  let oldPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let message = '';
  let errors: Record<string, string[]> = {};

  const nameSchema = z.object({
    name: z.string().min(1, { message: '姓名不能为空' }),
  });
  const passwordSchema = z.object({
    oldPassword: z.string().min(1, { message: '当前密码不能为空' }),
    newPassword: z.string().min(8, { message: '新密码至少需要8个字符' }),
    password: z.string().min(8, { message: '确认新密码至少需要8个字符' }),
  });

  onMount(async () => {
    user = await apiClient.getCurrentUser();
    newName = user.username;
  });

  async function updateName() {
    const validatedParams = nameSchema.safeParse({ name: newName });
    if (!validatedParams.success) {
      errors = validatedParams.error.flatten().fieldErrors;
      return;
    }
    const result = await apiClient.updateUserName(newName);
    if (result.success) {
      user.username = newName;
      message = '姓名更新成功';
      errors = {};
    } else {
      errors['newName'] = result.errors;
    }
  }

  async function updatePassword() {
    const validatedParams = passwordSchema.safeParse({ oldPassword, newPassword, password: confirmPassword });
    if (!validatedParams.success) {
      errors = validatedParams.error.flatten().fieldErrors;
      return;
    }
    if (newPassword !== confirmPassword) {
      errors.password = ['两次输入密码不匹配'];
      return;
    }
    const result = await apiClient.updateUserPassword(oldPassword, newPassword);
    if (result.success) {
      oldPassword = newPassword = confirmPassword = '';
      message = '密码更新成功';
      errors = {};
    } else {
      errors = result.errors;
    }
  }
</script>

<div class="bg-white p-6 w-1/2 border border-gray-300 rounded-md mx-auto">
  <h1 class="text-2xl font-bold mb-4">账户信息</h1>

  <div class="mb-4">
    <p><strong>邮箱：</strong> {user.email}</p>
    <p><strong>姓名：</strong> {user.username}</p>
    <p><strong>角色：</strong> {user.role}</p>
  </div>

  <form on:submit|preventDefault={updateName} class="mb-6">
    <h2 class="text-xl font-semibold mb-2">更新姓名</h2>
    <Textfield
      style="width: 100%;"
      helperLine$style="width: 100%;"
      bind:value={newName}
      label="新姓名"
      required
      invalid={!!errors.newName}
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.newName?.[0] || ""}</span>
      </HelperLine>
    </Textfield>
    <div class="flex justify-end mt-2">
      <Button on:click={updateName}>
        <Label>更新</Label>
      </Button>
    </div>
  </form>

  <form on:submit|preventDefault={updatePassword} class="mb-6">
    <h2 class="text-xl font-semibold mb-2">修改密码</h2>
    <Textfield
      style="width: 100%;"
      helperLine$style="width: 100%;"
      type="password"
      bind:value={oldPassword}
      label="当前密码"
      required
    />
    <Textfield
      style="width: 100%;"
      helperLine$style="width: 100%;"
      type="password"
      bind:value={newPassword}
      label="新密码"
      required
      invalid={!!errors.newPassword}
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.newPassword?.[0] || ""}</span>
      </HelperLine>
    </Textfield>
    <Textfield
      style="width: 100%;"
      helperLine$style="width: 100%;"
      type="password"
      bind:value={confirmPassword}
      label="确认新密码"
      required
      invalid={!!errors.password}
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.password?.[0] || ""}</span>
      </HelperLine>
    </Textfield>
    <div class="flex justify-end mt-2">
      <Button on:click={updatePassword}>
        <Label>修改密码</Label>
      </Button>
    </div>
  </form>

  {#if message}
    <p class="text-sm font-semibold {message.includes('成功') ? 'text-green-600' : 'text-red-600'}">
      {message}
    </p>
  {/if}
</div>
