// 'use client';

// import * as React from 'react';
// import { format } from 'date-fns';
// import { Calendar as CalendarIcon } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/UI/button';
// import { Calendar } from '@/components/UI/calendar';
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from '@/components/UI/popover';

// interface DatePickerProps {
//     value?: Date;
//     onChange?: (date: Date) => void;
//     placeholder?: string;
//     icon?: React.ReactNode;
//     className?: string;
// }

// export function DatePicker({
//     value,
//     onChange,
//     placeholder = 'Pick a date',
//     icon = <CalendarIcon className="h-4 w-4" />,
//     className,
// }: DatePickerProps) {
//     const [date, setDate] = React.useState<Date | undefined>(value);
//     const [open, setOpen] = React.useState(false);

//     React.useEffect(() => {
//         setDate(value);
//     }, [value]);

//     const handleSelect = (newDate: Date | undefined) => {
//         setDate(newDate);
//         if (newDate && onChange) {
//             onChange(newDate);
//         }
//         setOpen(false);
//     };

//     return (
//         <Popover open={open} onOpenChange={setOpen}>
//             <PopoverTrigger asChild>
//                 <Button
//                     variant="outline"
//                     className={cn(
//                         'w-full justify-start text-left font-normal',
//                         !date && 'text-muted-foreground',
//                         className
//                     )}
//                 >
//                     {icon}
//                     {date ? (
//                         <span className="ml-2">{format(date, 'PPP')}</span>
//                     ) : (
//                         <span className="ml-2">{placeholder}</span>
//                     )}
//                 </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="start">
//                 <Calendar
//                     mode="single"
//                     selected={date}
//                     onSelect={handleSelect}
//                     initialFocus
//                 />
//             </PopoverContent>
//         </Popover>
//     );
// }
