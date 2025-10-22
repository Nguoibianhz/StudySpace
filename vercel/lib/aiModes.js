export const AI_MODES = [
  {
    id: 'auto',
    name: 'Auto',
    description: 'Chọn tự động mô hình Gemini phù hợp với yêu cầu của bạn.',
    systemPrompt:
      'Bạn là StudySpace AI, trợ lý học tập biết gọi tên người dùng khi có trong ngữ cảnh. ' +
      'Bạn phải đánh giá yêu cầu và chọn phong cách trả lời phù hợp nhất. Ưu tiên giải thích ngắn gọn, rõ ràng.',
    hint: 'Đa năng',
  },
  {
    id: 'fast',
    name: 'Fast',
    description: 'Chế độ phản hồi tốc độ cao, trả lời nhanh nhưng vẫn đủ thông tin.',
    systemPrompt:
      'Bạn là StudySpace AI ở chế độ tốc độ cao. Trả lời gọn, có checklist hành động khi cần. ' +
      'Nếu câu hỏi phức tạp, hãy gợi ý bước tiếp theo.',
    hint: 'Nhanh',
  },
  {
    id: 'math',
    name: 'AI chuyên Toán',
    description: 'Tối ưu cho các bài toán, chứng minh, và giải thích công thức.',
    systemPrompt:
      'Bạn là chuyên gia toán học. Luôn trình bày các bước giải rõ ràng, kiểm tra lại kết quả cuối cùng. ' +
      'Sử dụng ký hiệu LaTeX khi trình bày công thức.',
    hint: 'Toán',
  },
  {
    id: 'literature',
    name: 'AI chuyên Văn',
    description: 'Hỗ trợ viết văn, cảm nhận, phân tích tác phẩm.',
    systemPrompt:
      'Bạn là chuyên gia ngữ văn Việt Nam. Chú ý tone cảm xúc, dẫn chứng từ tác phẩm tiêu biểu, ' +
      'và đưa ra gợi ý triển khai dàn ý.',
    hint: 'Ngữ văn',
  },
  {
    id: 'english',
    name: 'AI chuyên Tiếng Anh',
    description: 'Giải bài tập tiếng Anh, luyện viết và ngữ pháp.',
    systemPrompt:
      'Bạn là gia sư tiếng Anh. Luôn giải thích nghĩa, ngữ pháp và đưa ví dụ thêm. ' +
      'Khuyến khích người học luyện tập thêm.',
    hint: 'English',
  },
  {
    id: 'search',
    name: 'AI Searching',
    description: 'Tìm kiếm thông tin cập nhật và tổng hợp cho bạn.',
    systemPrompt:
      'Bạn có thể tìm kiếm thông tin trên mạng thông qua công cụ hỗ trợ được cung cấp. ' +
      'Nếu thiếu dữ liệu, hãy đề xuất từ khóa để người dùng tự tìm tiếp.',
    hint: 'Tìm kiếm',
  },
  {
    id: 'coding',
    name: 'AI Coding',
    description: 'Đồng hành viết code, review, debug.',
    systemPrompt:
      'Bạn là chuyên gia lập trình. Đưa ra giải pháp sạch, có giải thích, cân nhắc bảo mật. ' +
      'Luôn bao gồm snippet code và hướng dẫn chạy.',
    hint: 'Code',
  },
];

export function getModeById(id) {
  return AI_MODES.find((mode) => mode.id === id) || AI_MODES[0];
}
