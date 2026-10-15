import { useNavSlots } from "@/hooks/useNavSlots";

export default function OrganizerLayout() {
    const slots = useNavSlots({
        left: <div>Ringkasan</div>,
        right: <div className="flex flex-row gap-4">
            <div className="flex">
                <div>hari</div>
                <div>bulan</div>
                <div>tahun</div>
            </div>
            <button>Buat Acara</button>
        </div>
    })

    const sidebar = [
        
    ]
}