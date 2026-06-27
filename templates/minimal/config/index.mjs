// =============================================================================
// config/index.mjs — 角色配置界面
// =============================================================================
// 如果不需要配置界面，可以删除这个文件和 main.mjs 中的 config 引用。
// =============================================================================

/**
 * 获取当前的配置数据
 * @returns {Promise<object>}
 */
export async function GetData() {
  return {
    // 在这里定义你的配置项
    // 例如: someSetting: 'default value',
  }
}

/**
 * 保存配置数据
 * @param {object} data - 从配置界面提交的数据
 * @returns {Promise<void>}
 */
export async function SetData(data) {
  // 在这里处理配置的保存
  // 例如: saveToDisk(data)
}
