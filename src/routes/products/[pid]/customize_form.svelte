<script lang="ts">
  import { page } from '$app/stores';
  import Dialog, { Title, Content } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import Textfield, { HelperLine } from '@smui/textfield';
  import { APIClient } from '$lib/api';
	import { createEventDispatcher } from 'svelte';
  import { z } from 'zod';

  const formSchema = z.object({
    customized_by: z.string().min(1, { message: '定制化负责人不能为空' }),
    customization: z.string().min(1, { message: '定制化改动信息不能为空' }),
  });
  
  const dispatch = createEventDispatcher();
  let client = new APIClient();
  let pid = $page.params.pid;
  let stock_id: number | null = null;
  export let is_open = false;

  let customized_by: string = '';
  let customization: string = '';
  let errors: Record<string, string[]> = {};

  export function open(stock_id: number) {
    is_open = true;
    stock_id = stock_id;
  }

  async function submit() {
    const validatedParams = formSchema.safeParse({
      customized_by,
      customization,
    });
    if (!validatedParams.success) {
      errors = validatedParams.error.flatten().fieldErrors;
      return;
    }

    const result = await client.updateProductCustomization(stock_id!, customized_by, customization);
    if (result.success) {
      customized_by = '';
      customization = '';
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
    <Textfield
      bind:value={customized_by} 
      label="定制化负责人"
      style="width: 100%;"
      required
      invalid={!!errors.customized_by}  
    >
      <HelperLine slot="helper">
        {#if errors.customized_by}
          <span class="text-red-500">{errors.customized_by}</span>
        {:else}
          <span class="text-gray-500">请填写定制化负责人</span>
        {/if}
      </HelperLine>
    </Textfield>
    <Textfield
      style="width: 500px; margin-top: 1rem;"
      helperLine$style="width: 100%;"
      textarea
      bind:value={customization}
      label="定制化改动信息"
      required
      invalid={!!errors.customization}
    >
      <HelperLine slot="helper">
        {#if errors.customization}
          <span class="text-red-500">{errors.customization}</span>
        {:else}
          <span class="text-gray-500">请填写定制化改动信息</span>
        {/if}
      </HelperLine>
    </Textfield>
    <div class="flex justify-end mt-4">
      <Button on:click={submit} >
        <Label>提交</Label>
      </Button>
      <Button defaultAction on:click={() => {
        customized_by = '';
        customization = '';
        errors = {};
        is_open = false;
      }} >
        <Label>取消</Label>
      </Button>
    </div>
  </Content>
</Dialog>
