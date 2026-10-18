import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RuleCatalogue } from '@/components/RuleCatalogue';
import { BookOpen, Cpu, Lock } from 'lucide-react';

export default function RulesPage() {
  return <div className="min-h-screen flex flex-col bg-cyber-grid"><Header />
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12 space-y-8">
      <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">← К анализу видео</Link>
      <div><p className="text-xs uppercase tracking-widest text-sky-600">Методика</p><h1 className="mt-3 text-4xl font-bold">От наблюдения к проверке</h1><p className="mt-4 max-w-2xl text-slate-600">Сервис ищет визуальные признаки возможных нарушений. Оценка относится только к видимым действиям и настроенным правилам.</p></div>
      <div className="grid gap-4 md:grid-cols-3">{[
        { Icon: Cpu, title: 'Действия и взаимодействия', text: 'Анализируются движения сотрудника и посетителя, передача предметов, работа с наличностью и перемещения относительно рабочего места.' },
        { Icon: Lock, title: 'Локальная обработка', text: 'Видео обрабатывается внутри сервиса. Звук и идентификация лиц не используются.' },
        { Icon: BookOpen, title: 'Проверка человеком', text: 'Каждое основание связано с открытым источником РК. Сервис показывает наблюдения и неопределённости; окончательное решение принимает проверяющий.' },
      ].map(({Icon, title, text}, i) => <article key={i} className="glass-panel rounded-2xl p-6"><Icon className="text-sky-600" size={24} /><h2 className="mt-4 font-semibold">{title as string}</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">{text as string}</p></article>)}</div>
      <RuleCatalogue />
      <p className="text-sm text-zinc-500">Ракурс камеры, перекрытия и выборка кадров могут влиять на результат. Сервис не проверяет проводки, системную сверку или полномочия человека по внешности.</p>
    </main><Footer /></div>;
}
