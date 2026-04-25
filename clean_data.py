import json

input_file = "dataset.jsonl"
output_file = "dataset_ready.jsonl"
valid_count = 0
error_count = 0

with open(input_file, "r", encoding="utf-8") as f, open(output_file, "w", encoding="utf-8") as out:
    for i, line in enumerate(f):
        line = line.strip()
        if not line: continue
        try:
            # Kiểm tra xem dòng đó có phải JSON chuẩn không
            data = json.loads(line)
            
            # Kiểm tra xem assistant có phải là string không (tránh lỗi GPT nhả object trực tiếp)
            assistant_content = data["conversations"][2]["content"]
            if isinstance(assistant_content, dict):
                # Tự động escape nếu AI quên
                data["conversations"][2]["content"] = json.dumps(assistant_content, ensure_ascii=False)
            
            out.write(json.dumps(data, ensure_ascii=False) + "\n")
            valid_count += 1
        except Exception as e:
            print(f"❌ Dòng {i+1} lỗi: {e}")
            error_count += 1

print(f"\n✅ Đã lọc sạch! Hàng ngon: {valid_count} dòng. Hàng lỗi: {error_count} dòng.")
print(f"🚀 File '{output_file}' đã sẵn sàng để lên Modal!")