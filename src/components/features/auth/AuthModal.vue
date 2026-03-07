<template>
  <el-dialog v-model="dialogVisible" width="720px" :show-close="false" class="login-dialog">
    <!-- ======================= header ======================= -->
    <template #header="{ close }">
      <div class="header">
        <div class="title">登录</div>
        <el-icon @click="close" class="close-icon">
          <Close />
        </el-icon>
      </div>
    </template>
    <!-- ======================= content ======================= -->
    <div class="content">
      <!-- ======== 左侧二维码 ======== -->
      <div class="qr-section">
        <div class="qr-title">扫描二维码登录</div>
        <el-image style="width: 160px; height: 160px; border: 1px solid #eee" :src="qrUrl" fit="cover" />
        <div class="qr-desc">
          <p>
            请使用
            <a href="https://app.bilibili.com/" target="_blank">哔哩哔哩客户端</a>
          </p>
          <p>扫码登录或扫码下载APP</p>
        </div>
      </div>

      <div class="line"></div>

      <!-- ======== 右侧登录 ======== -->
      <div class="right">
        <!-- 选项 tab -->
        <el-tabs v-model="tab">
          <el-tab-pane label="密码登录" name="pwd" />
          <el-tab-pane label="短信登录" name="sms" />
        </el-tabs>

        <!-- pwd：密码登录 -->
        <div v-if="tab === 'pwd'" class="form">
          <el-form :model="form">
            <el-form-item label="账号">
              <el-input v-model="form.username" placeholder="请输入账号" />
            </el-form-item>

            <el-form-item label="密码">
              <el-input v-model="form.password" placeholder="请输入密码" show-password />
            </el-form-item>
          </el-form>

          <div class="btn-wrap">
            <el-button type="info" text>注册</el-button>
            <el-button type="primary" :disabled="!canLogin" @click="login">登录</el-button>
          </div>
        </div>

        <!-- sms：短信登录 -->
        <div v-else class="form">
          <el-form>
            <el-form-item label="手机号">
              <el-input placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item label="验证码">
              <el-input placeholder="验证码" />
            </el-form-item>
          </el-form>

          <div class="btn-wrap">
            <el-button type="primary" disabled>注册/登录</el-button>
          </div>
        </div>

        <!-- 其他方式登录 -->
        <div class="sns">
          <div class="sns-title">其他方式登录</div>
          <div class="sns-list">
            <span class="sns-item">微信登录</span>
            <span class="sns-item">微博登录</span>
            <span class="sns-item">QQ登录</span>
          </div>
        </div>
      </div>
    </div>
    <!-- ======================= footer ======================= -->
    <template #footer>
      <div class="footer">
        登录或完成注册即代表你同意
        <b>用户协议</b>
        和
        <b>隐私政策</b>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { apiGetUserSimple, apiLogin } from "@/api/user";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store";
import { c } from "naive-ui";

// 外部控制属性
const props = defineProps({ // properties 单向数据流，父组件->子组件
  dialogVisible: Boolean,
});
const emit = defineEmits(["update:dialogVisible", "success"]); // 声明组件会发出的事件
// update:dialogVisible：用于 v-model 的更新约定（双向绑定协议）
// success：自定义事件，登录成功后用于通知父组件

// const userStore = useUserStore()
// const isLogin = computed(() => userStore.isLogin)

const dialogVisible = computed({ // 创建一个带 getter/setter 的计算属性
  get: () => props.dialogVisible, // 从 props 读值
  set: (val) => emit("update:dialogVisible", val),// 当给它赋值时（set）会 emit 出 update:dialogVisible 事件并把新值传给父组件
}); // 组件内不能直接修改 props（props 是只读的）。如果你想在组件内改变父组件传下来的可见状态，需通过事件通知父组件修改它的 state（v-model 语法糖会自动处理）。
// 使用 computed 的 get/set 可以把外部 prop 包装成一个内部可读写的响应式变量，更新时会触发 set，从而 emit update:dialogVisible 给父组件，父组件接到事件后更新其状态

const tab = ref("pwd"); // 当前选中的标签页
const form = ref({
  username: "",
  password: "",
});

const qrUrl = "/qr-demo.png";

const canLogin = computed(() => {
  return form.value.username && form.value.password;
});

const login = async () => {
  const { username, password } = form.value;
  try {
    const res = await apiLogin(username, password);
    console.log("登录成功，token：", res);
    localStorage.setItem("token", res);
    emit("success", res);
    const userSimple = await apiGetUserSimple();
    useUserStore().setUser(userSimple);
    console.log("用户信息：", userSimple);

  } catch (error) {
    ElMessage.error("账号或密码错误");
  }
  dialogVisible.value = false;
};
</script>

<style scoped>
.login-dialog {
  border-radius: 12px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-icon {
  cursor: pointer;
}

.content {
  display: flex;
}

.qr-section {
  width: 260px;
  text-align: center;
}

.qr-title {
  margin-bottom: 10px;
  font-weight: 600;
}

.qr-desc {
  font-size: 12px;
  color: #666;
}

.line {
  width: 1px;
  background: #eee;
  margin: 0 20px;
}

.right {
  flex: 1;
}

.form {
  padding: 10px 0;
}

.btn-wrap {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.sns {
  margin-top: 20px;
}

.sns-title {
  font-size: 12px;
  color: #666;
}

.sns-list {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.sns-item {
  font-size: 14px;
  color: #409eff;
  cursor: pointer;
}

.footer {
  text-align: center;
  font-size: 12px;
  color: #555;
}
</style>
