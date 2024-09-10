<script lang="ts">
  import Dialog, { Title, Content } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import Textfield, { HelperLine } from "@smui/textfield";
  import Select, { Option } from "@smui/select";
  import { APIClient, type UserDTO } from "$lib/api";
  import { createEventDispatcher } from "svelte";
  import { z } from "zod";

  const dispatch = createEventDispatcher();
  let client = new APIClient();
  export let is_open = false;
  export let user: UserDTO | null = null;
  let errors: Record<string, string[]> = {};

  const formSchema = z.object({
    username: z.string().min(1, "Name is required"),
    role: z.enum(["admin", "user"]),
    password: z.nullable(z.string().min(8, "Password must be at least 8 characters long")),
  });

  let formData = {
    username: "",
    role: "user",
    password: null,
  };

  export function open(userData: UserDTO) {
    user = userData;
    formData = {
      username: user.username,
      role: user.role,
      password: null,
    };
    is_open = true;
  }

  async function submit() {
    if (!user) return;

    // Remove password if it's empty
    if (!formData.password) {
      formData.password = null;
    }

    const validatedParams = formSchema.safeParse(formData);
    if (!validatedParams.success) {
      errors = validatedParams.error.flatten().fieldErrors;
      return;
    }

    const result = await client.updateUser(user.id, validatedParams.data);
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
  aria-labelledby="edit-user-title"
  aria-describedby="edit-user-content"
>
  <Title id="edit-user-title">编辑用户</Title>
  <Content id="edit-user-content">
    <Textfield
      style="width: 100%"
      value={user?.email || ""}
      label="邮箱"
      type="email"
      disabled
    />

    <Textfield
      style="width: 100%"
      bind:value={formData.username}
      label="姓名"
      required
      invalid={!!errors.username}
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.username?.[0] || ""}</span>
      </HelperLine>
    </Textfield>

    <Textfield
      style="width: 100%"
      bind:value={formData.password}
      label="密码"
      type="password"
      invalid={!!errors.password}
    >
      <HelperLine slot="helper">
        <span class="text-red-500">{errors.password?.[0] || ""}</span>
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
        <Label>保存</Label>
      </Button>
      <Button
        defaultAction
        on:click={() => {
          is_open = false;
        }}
      >
        <Label>取消</Label>
      </Button>
    </div>
  </Content>
</Dialog>
