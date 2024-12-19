package result

type Result struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
	Code    int         `json:"code"`
}

func NewResult(success bool, message string, data interface{}, code int) *Result {
	return &Result{
		Success: success,
		Message: message,
		Data:    data,
		Code:    code,
	}
}

func NewSuccessResult(data interface{}) *Result {
	return NewResult(true, "success", data, 200)
}

func NewErrorResult(message string, code int) *Result {
	return NewResult(false, message, nil, code)
}
