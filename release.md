# Shuvi 发布指南

## 📖 概述

Shuvi 使用自动化发布脚本来管理 monorepo 中多个包的版本发布。这个脚本基于 Vue.js Core 的发布脚本修改而来，提供了完整的发布流程自动化。

## 🚀 快速开始

### 基本用法

```bash
# 交互式发布（推荐）
pnpm release

# 指定版本发布
pnpm release 2.0.0

# 预发布版本
pnpm release 2.0.0-beta.1
```

## 📋 命令行选项

| 选项 | 说明 | 示例 |
|------|------|------|
| `--help`, `-h` | 显示帮助信息 | `pnpm release --help` |
| `--tag <value>` | 指定 npm 发布标签 | `pnpm release --tag beta` |
| `--pre <value>` | 预发布模式 | `pnpm release --pre alpha` |
| `--dry` | 干运行模式（不实际执行） | `pnpm release --dry` |
| `--skipTests` | 跳过测试 | `pnpm release --skipTests` |
| `--skipBuild` | 跳过构建 | `pnpm release --skipBuild` |

## 🔢 版本格式

支持标准的语义化版本格式：

```bash
# 正式版本
pnpm release 1.0.0
pnpm release 2.1.5

# 预发布版本
pnpm release 1.0.0-alpha.1
pnpm release 1.0.0-beta.2
pnpm release 1.0.0-rc.1

# 开发版本
pnpm release 2.0.0-dev.1
```

## 🔄 发布流程

### 📋 操作者需要做的（手动）

#### 1. 发布前准备
- [ ] **确保工作目录干净** - 提交或暂存所有更改
- [ ] **检查测试状态** - 确保所有测试通过
- [ ] **代码审查完成** - 确保代码质量
- [ ] **准备发布说明** - 记录重要变更

#### 2. 执行发布命令
```bash
# 交互式发布（推荐）
pnpm release

# 或指定版本
pnpm release 2.0.0
```

#### 3. 确认发布
- 脚本会提示确认版本号，需要手动确认
- 可以选择跳过某些步骤（如测试、构建）

#### 4. 发布后验证
- [ ] **检查 npm 包** - 确认包已正确发布
- [ ] **验证 Git 标签** - 确认标签已推送
- [ ] **测试安装** - 验证新版本可正常安装

### 🤖 脚本自动处理（无需手动）

#### 1. 版本管理
- ✅ **自动版本递增** - 根据选择计算新版本号
- ✅ **更新所有包版本** - 根目录和所有子包
- ✅ **更新内部依赖** - 包间的依赖关系自动同步

#### 2. 构建和测试
- ✅ **清理构建缓存** - `pnpm clean`
- ✅ **安装依赖** - `pnpm install`
- ✅ **构建所有包** - `pnpm build`
- ✅ **运行测试套件** - Jest 单元测试和 E2E 测试

#### 3. 变更日志
- ✅ **生成变更日志** - 基于 Git 提交历史
- ✅ **更新 CHANGELOG.md** - 自动添加新版本信息

#### 4. Git 操作
- ✅ **添加所有文件** - `git add -A`
- ✅ **提交更改** - `git commit -m "release: v{version}"`
- ✅ **创建标签** - `git tag v{version}`
- ✅ **推送标签** - `git push origin refs/tags/v{version}`
- ✅ **推送代码** - `git push`

#### 5. npm 发布
- ✅ **逐个发布包** - 自动遍历所有包
- ✅ **处理发布标签** - 根据版本类型设置标签
- ✅ **跳过私有包** - 自动识别并跳过
- ✅ **跳过已发布包** - 避免重复发布错误
- ✅ **错误处理** - 优雅处理发布失败

#### 6. 智能优化
- ✅ **依赖关系检查** - 确保包间依赖版本一致
- ✅ **内存管理** - 处理大型项目的内存需求
- ✅ **网络重试** - 处理网络中断问题
- ✅ **回滚机制** - 出错时自动回滚版本号

## 💡 使用场景

### 正式发布

```bash
# 交互式选择版本类型
pnpm release

# 或直接指定版本
pnpm release 2.0.0
```

### 预发布测试

```bash
# Beta 版本
pnpm release 2.0.0-beta.1 --tag beta

# Alpha 版本
pnpm release 2.0.0-alpha.1 --tag alpha

# RC 版本
pnpm release 2.0.0-rc.1 --tag rc
```

### 开发版本

```bash
# 开发版本（跳过测试）
pnpm release 2.0.0-dev.1 --skipTests

# 快速发布（跳过测试和构建）
pnpm release 2.0.0-dev.1 --skipTests --skipBuild
```

### 安全测试

```bash
# 干运行模式，查看会做什么但不实际执行
pnpm release 2.0.0 --dry

# 干运行 + 跳过测试
pnpm release 2.0.0 --dry --skipTests
```

## 🏗️ 包管理

### 自动包发现

脚本会自动扫描 `packages/` 目录下的所有包：

```javascript
const packages = fs
  .readdirSync(path.resolve(__dirname, '../packages'))
  .filter(p => !ingoredPackages.includes(p) && !p.endsWith('.ts') && !p.startsWith('.'));
```

### 排除的包

- `compiler-swc` - 被明确排除
- 以 `.ts` 结尾的文件
- 以 `.` 开头的隐藏文件

### 依赖更新

脚本会自动更新包间的依赖关系：

```javascript
// 更新 @shuvi/* 包之间的依赖
if (dep === 'shuvi' || (dep.startsWith('@shuvi') && packages.includes(dep.replace(/^@shuvi\//, '')))) {
  deps[dep] = version;
}
```

## ⚠️ 注意事项

### 🔧 操作者需要准备

#### 权限要求
- **npm 发布权限**：需要发布到 npm 的权限
- **Git 推送权限**：需要推送到远程仓库的权限

#### 环境准备
- **工作目录状态**：确保工作目录干净（无未提交的更改）
- **测试状态**：确保所有测试通过
- **构建状态**：确保构建成功
- **网络环境**：确保网络连接稳定

### 🤖 脚本自动处理

#### 版本一致性
- ✅ 所有包会使用相同的版本号
- ✅ 包间的依赖关系会自动更新
- ✅ 自动验证版本号符合语义化版本规范

#### 环境检查
- ✅ 自动检查 Git 状态
- ✅ 自动验证版本号格式
- ✅ 自动处理依赖关系

## 🔧 故障排除

### 🤖 脚本自动处理的问题

#### 跳过已发布的包
脚本会自动跳过已发布的包并继续处理其他包：

```javascript
if (e.stderr && e.stderr.match(/previously published/)) {
  console.log(chalk.red(`Skipping already published: ${pkgName}`));
}
```

#### 回滚机制
如果发布过程中出错，脚本会自动回滚版本号：

```javascript
main().catch(err => {
  updateVersions(currentVersion);
  console.error(err);
});
```

#### 网络重试
脚本会自动处理网络中断和重试逻辑。

### 🔧 操作者需要处理的问题

#### 内存问题
对于大型项目，操作者需要手动增加内存限制：

```bash
NODE_OPTIONS=--max_old_space_size=8192 pnpm release
```

#### 网络中断恢复
如果发布过程中网络中断，操作者需要：

1. **检查发布状态** - 查看哪些包已经发布成功
2. **重新运行脚本** - 已发布的包会被自动跳过
3. **手动处理** - 如果脚本无法恢复，手动发布剩余包

#### 权限问题
如果遇到权限错误，操作者需要：

1. **检查 npm 登录状态** - `npm whoami`
2. **重新登录 npm** - `npm login`
3. **检查 Git 权限** - 确认有推送权限

## 📝 最佳实践

### 1. 发布前检查清单（操作者需要做）

- [ ] **代码质量检查** - 确保代码审查完成
- [ ] **测试验证** - 手动运行 `pnpm test` 确保通过
- [ ] **构建验证** - 手动运行 `pnpm build` 确保成功
- [ ] **工作目录清理** - 提交或暂存所有更改
- [ ] **发布说明准备** - 记录重要变更和影响
- [ ] **权限确认** - 确保有 npm 发布和 Git 推送权限

### 2. 版本命名规范

- **正式版本**：`1.0.0`, `2.1.5`
- **预发布版本**：`1.0.0-alpha.1`, `1.0.0-beta.2`, `1.0.0-rc.1`
- **开发版本**：`2.0.0-dev.1`

### 3. 发布流程建议

#### 操作者决策点
1. **版本类型选择** - 根据变更类型选择 patch/minor/major
2. **发布时机** - 决定何时发布正式版本
3. **跳过选项** - 决定是否跳过测试或构建

#### 脚本自动化建议
1. **开发阶段**：使用 `--skipTests` 快速发布开发版本
2. **测试阶段**：使用预发布版本进行测试
3. **正式发布**：确保所有测试通过后再发布

### 4. 安全发布

#### 操作者需要做的
- 首次发布新版本时使用 `--dry` 模式预览
- 检查生成的变更日志内容
- 确认版本号和标签设置正确

#### 脚本自动保障
- 自动验证版本号格式
- 自动处理发布标签
- 自动跳过已发布的包

## 🎯 实际示例

### 从开发到正式发布

```bash
# 1. 开发版本
pnpm release 2.0.0-dev.1 --skipTests

# 2. Alpha 测试
pnpm release 2.0.0-alpha.1 --tag alpha

# 3. Beta 测试
pnpm release 2.0.0-beta.1 --tag beta

# 4. RC 版本
pnpm release 2.0.0-rc.1 --tag rc

# 5. 正式发布
pnpm release 2.0.0
```

### 快速修复发布

```bash
# 补丁版本
pnpm release 2.0.1

# 或交互式选择
pnpm release
# 选择 "patch (2.0.1)"
```

## 📚 相关文档

- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献指南
- [package.json](./package.json) - 项目配置
- [scripts/release.js](./scripts/release.js) - 发布脚本源码
- [scripts/releaseHelp.js](./scripts/releaseHelp.js) - 帮助信息

## 🤝 贡献

如果你发现发布脚本的问题或有改进建议，请：

1. 查看现有的 [Issues](https://github.com/shuvijs/shuvi/issues)
2. 创建新的 Issue 描述问题
3. 提交 Pull Request 修复问题

---

*最后更新：2024年* 