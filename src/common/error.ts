/**
 * 无效密码错误，表示提供的密码无效。
 */
export class InvalidPassword extends Error {
    /**
     * 构造函数。
     * @param message - 错误消息。
     * @param options - 错误选项。
     */
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options)
    }
}
