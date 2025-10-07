interface ReceiptData {
  companyName: string;
  parkingLotName: string;
  phoneNumber: string;
  registrationNumber: string;
  parkingFee: number;
  discount: number;
  receiptDate: string;
  managementNumber: string;
  recipientName: string;
}

interface ReceiptTemplateProps {
  data: ReceiptData;
}

export function ReceiptTemplate({ data }: ReceiptTemplateProps) {
  const total = data.parkingFee - data.discount;
  
  return (
    <div className="bg-white content-stretch flex items-start relative w-full" data-name="Receipt">
      <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
        <div className="flex flex-col items-center size-full">
          <div className="box-border content-stretch flex flex-col gap-[60px] items-center px-[160px] py-[40px] relative w-full">
            {/* Company Name and Registration Number */}
            <div className="content-stretch flex flex-col gap-[30px] items-center relative shrink-0">
              <div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#23221f] text-[45px] text-center text-nowrap">
                <p className="leading-[1.25] text-nowrap whitespace-pre">{data.companyName}</p>
              </div>
              <div className="content-stretch flex font-['Noto_Sans_JP:Regular',_sans-serif] gap-[10px] items-center leading-[0] not-italic relative shrink-0 text-[#23221f] text-[35px] text-center text-nowrap">
                <div className="flex flex-col justify-center relative shrink-0">
                  <p className="leading-[1.25] text-nowrap whitespace-pre">登録番号</p>
                </div>
                <div className="flex flex-col justify-center relative shrink-0">
                  <p className="leading-[1.25] text-nowrap whitespace-pre">{data.registrationNumber}</p>
                </div>
              </div>
            </div>

            {/* Parking Lot Info */}
            <div className="content-stretch flex flex-col gap-[15px] items-center leading-[0] not-italic relative shrink-0 text-[#23221f] text-center text-nowrap">
              <div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] justify-center relative shrink-0 text-[45px]">
                <p className="leading-[1.25] text-nowrap whitespace-pre">{data.parkingLotName}</p>
              </div>
              <div className="flex flex-col font-['Noto_Sans_JP:Regular',_sans-serif] justify-center relative shrink-0 text-[35px]">
                <p className="leading-[1.25] text-nowrap whitespace-pre">{data.phoneNumber}</p>
              </div>
            </div>

            {/* Receipt Title */}
            <div className="content-stretch flex flex-col font-['Noto_Sans_JP:Regular',_sans-serif] gap-[15px] items-center leading-[0] not-italic relative shrink-0 text-[#23221f] text-[45px] text-center text-nowrap">
              <div className="content-stretch flex gap-[16px] items-start justify-center relative shrink-0">
                <div className="flex flex-col justify-center relative shrink-0">
                  <p className="leading-[1.25] text-nowrap whitespace-pre">領収書</p>
                </div>
                <div className="flex flex-col justify-center relative shrink-0">
                  <p className="leading-[1.25] text-nowrap whitespace-pre">兼</p>
                </div>
              </div>
              <div className="flex flex-col justify-center relative shrink-0">
                <p className="leading-[1.25] text-nowrap whitespace-pre">お客様控え（ご利用明細書）</p>
              </div>
            </div>

            {/* Recipient Name */}
            {data.recipientName && (
              <div className="flex flex-col font-['Noto_Sans_JP:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#23221f] text-[40px] text-center text-nowrap">
                <p className="leading-[1.25] whitespace-pre">{data.recipientName}</p>
              </div>
            )}

            {/* Receipt Details */}
            <div className="content-stretch flex flex-col gap-[40px] items-center relative shrink-0 w-full">
              <div className="box-border content-stretch flex flex-col gap-[40px] items-start pb-0 pt-[40px] px-0 relative shrink-0 w-full">
                <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-[rgba(0,0,0,0.3)] border-solid inset-0 pointer-events-none" />
                
                {/* Parking Fee */}
                <div className="content-stretch flex font-['Noto_Sans_JP:Regular',_sans-serif] items-start justify-between leading-[0] not-italic relative shrink-0 text-[#23221f] text-[35px] text-center text-nowrap w-full">
                  <div className="flex flex-col justify-center relative shrink-0">
                    <p className="leading-[1.25] text-nowrap whitespace-pre">駐車料金</p>
                  </div>
                  <div className="flex flex-col justify-center relative shrink-0">
                    <p className="leading-[1.25] text-nowrap whitespace-pre">¥{data.parkingFee.toLocaleString()}</p>
                  </div>
                </div>

                {/* Discount */}
                <div className="content-stretch flex font-['Noto_Sans_JP:Regular',_sans-serif] items-start justify-between leading-[0] not-italic relative shrink-0 text-[#23221f] text-[35px] text-center text-nowrap w-full">
                  <div className="flex flex-col justify-center relative shrink-0">
                    <p className="leading-[1.25] text-nowrap whitespace-pre">割引料金</p>
                  </div>
                  <div className="flex flex-col justify-center relative shrink-0">
                    <p className="leading-[1.25] text-nowrap whitespace-pre">¥{data.discount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Total */}
                <div className="content-stretch flex font-['Noto_Sans_JP:Regular',_sans-serif] items-start justify-between leading-[0] not-italic relative shrink-0 text-[#23221f] text-center text-nowrap w-full">
                  <div className="content-stretch flex items-center relative shrink-0">
                    <div className="flex flex-col justify-center relative shrink-0 text-[35px]">
                      <p className="leading-[1.25] text-nowrap whitespace-pre">合計</p>
                    </div>
                    <div className="flex flex-col justify-center relative shrink-0 text-[30px]">
                      <p className="leading-[1.25] text-nowrap whitespace-pre">（内税10%対象）</p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center relative shrink-0 text-[35px]">
                    <p className="leading-[1.25] text-nowrap whitespace-pre">¥{total.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Management Number */}
            <div className="flex flex-col font-['Noto_Sans_JP:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#23221f] text-[35px] text-center text-nowrap">
              <p className="leading-[1.25] whitespace-pre">管理番号：{data.managementNumber}</p>
            </div>

            {/* Receipt Date */}
            <div className="flex flex-col font-['Noto_Sans_JP:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#23221f] text-[35px] text-center text-nowrap">
              <p className="leading-[1.25] whitespace-pre">{data.receiptDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
