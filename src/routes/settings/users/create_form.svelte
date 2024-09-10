<script lang="ts">
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import Textfield, { HelperLine } from "@smui/textfield";
  import Select, { Option } from "@smui/select";
  import { APIClient } from "$lib/api";
  import { createEventDispatcher } from "svelte";
  import { z } from "zod";

  const dispatch = createEventDispatcher();
  let client = new APIClient();
  export let is_open = false;
  let errors: Record<string, string[]> = {};

  const formSchema = z.object({
    username: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(["admin", "user"]),
  });

  let formData = {
    username: "",
    email: "",
    password: "",
    role: "user",
  };

  export function open() {
    is_open = true;
  }

  async function submit() {
    const validatedParams = formSchema.safeParse(formData);
    if (!validatedParams.success) {
      errors = validatedParams.error.flatten().fieldErrors;
      return;
    }
    const result = await client.createUser(validatedParams.data);
    if (result.success) {
      dispatch("success");
      is_open = false;
    } else {
      errors = result.errors;
    }
  }
</script>

<Dialog
  bind:open={is_open}
  aria-labelledby="create-user-title"
  aria-describedby="create-user-content"
>
  <Title id="create-user-title">添加新用户</Title>
  <Content id="create-user-content">
    <Textfield
      style="width: 100%"
      bind:value={formData.email}
      label="邮箱"
      type="email"
      required
      invalid={!!errors.email}
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.email || ""}</span>
      </HelperLine>
    </Textfield>

    <Textfield
      style="width: 100%"
      bind:value={formData.username}
      label="姓名"
      required
      invalid={!!errors.username}
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.username || ""}</span>
      </HelperLine>
    </Textfield>

    <Textfield
      style="width: 100%"
      bind:value={formData.password}
      label="密码"
      type="password"
      required
      invalid={!!errors.password}
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.password || ""}</span>
      </HelperLine>
    </Textfield>

    <Select
      style="width: 100%"
      bind:value={formData.role}
      label="角色"
      required
      invalid={!!errors.role}
    >
      <Option value="user">普通用户</Option>
      <Option value="admin">管理员</Option>
    </Select>

    <div class="flex justify-end gap-2">
      <Button on:click={submit}>
        <Label>提交</Label>
      </Button>
      <Button
        defaultAction
        on:click={() => {
          formData = {
            username: "",
            email: "",
            password: "",
            role: "user",
          };
          is_open = false;
        }}
      >
        <Label>取消</Label>
      </Button>
    </div>
  </Content>
</Dialog>
