<script lang="ts">
  import Button, { Label } from '@smui/button';
  import Textfield, { HelperLine } from '@smui/textfield';
  import Autocomplete from '@smui-extra/autocomplete';
  import { APIClient, type ProductSpecDTO } from '$lib/api';
	import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { z } from 'zod';

  let client = new APIClient();

  const productSpecSchema = z.object({
    model_no: z.string().min(1, { message: "型号不能为空" }),
    category: z.string().min(1, { message: "类别不能为空" }),
    product_name: z.string().min(1, { message: "产品名称不能为空" }),
    spec: z.string().min(1, { message: "规格不能为空" }),
    manufacturer: z.string().min(1, { message: "生产商不能为空" }),
  });

  const empty_spec = {
    model_no: '',
    category: '',
    product_name: '',
    spec: '',
    manufacturer: '',
  }
  let spec: ProductSpecDTO = empty_spec;
  let errors: Record<string, string[]> = {};

  let existCategories: string[] = [];
  let existProductName: string[] = [];
  let existManufacturer: string[] = [];

  onMount(() => {
    spec = empty_spec;
    errors = {};
    client.getPropertyEnum('category').then((json) => {
      existCategories = json;
    });
    client.getPropertyEnum('product_name').then((json) => {
      existProductName = json;
    });
    client.getPropertyEnum('manufacturer').then((json) => {
      existManufacturer = json;
    });
  });

  async function submit() {
    try {
      const validatedSpec = productSpecSchema.safeParse(spec);
      if (!validatedSpec.success) {
        errors = validatedSpec.error.flatten().fieldErrors;
        return;
      }
      const resp = await client.addProductSpec(validatedSpec.data);
      if (resp.success) {
        spec = empty_spec;
        errors = {};
        goto('/products/summary');
      } else {
        errors = resp.errors;
      }
    } catch (e: any) {
      console.log(e);
      errors = e.errors || {};
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
        <Label>新建产品</Label>
      </Button>
    </div>
    <div class="float-right">&nbsp;</div>
  </div>

  <div class="bg-white p-6 w-1/2 border border-gray-300 rounded-md mx-auto">
    <Textfield
      style="width: 100%;"
      helperLine$style="width: 100%;"
      bind:value={spec.model_no}
      label="型号(唯一标识)"
      required
      invalid={!!errors.model_no}
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.model_no || ""}</span>
      </HelperLine>
    </Textfield>
    <Autocomplete 
      combobox 
      options={existCategories} 
      bind:value={spec.category} 
      label="类别"
      textfield$required
      textfield$invalid={!!errors.category}
    >
    </Autocomplete>
    <div class="mdc-text-field-helper-line">
      <div class="mdc-text-field-helper-text text-red-500">{errors.category || ""}</div>
    </div>
    <Autocomplete 
      combobox 
      options={existProductName} 
      bind:value={spec.product_name} 
      label="产品名称"
      textfield$required
      style="width: 100%;"
      textfield$invalid={!!errors.product_name}
    >
    </Autocomplete>
    <div class="mdc-text-field-helper-line">
      <div class="mdc-text-field-helper-text text-red-500">{errors.product_name || ""}</div>
    </div>
    <Textfield
      style="width: 100%;"
      helperLine$style="width: 100%;"
      bind:value={spec.spec}
      label="规格"
      required
      invalid={!!errors.spec}
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.spec || ""}</span>
      </HelperLine>
    </Textfield>
    <Autocomplete 
      combobox 
      options={existManufacturer} 
      bind:value={spec.manufacturer} 
      label="生产商"
      textfield$required
      textfield$style="width: 100%;"
      textfield$invalid={!!errors.manufacturer}
    >
    </Autocomplete>
    <div class="mdc-text-field-helper-line">
      <div class="mdc-text-field-helper-text text-red-500">{errors.manufacturer || ""}</div>
    </div>
    <div class="flex justify-end mt-4">
      <Button on:click={submit}>
        <Label>提交</Label>
      </Button>
    </div>
  </div>
</div>
