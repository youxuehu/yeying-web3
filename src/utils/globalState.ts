// 定义全局变量的类型（可选但推荐）
export interface GlobalState {
  walletReady: boolean;
}

// 初始化全局状态
const globalState: GlobalState = {
  walletReady: false
};

// 导出该对象（引用是固定的，内容可变）
export default globalState;