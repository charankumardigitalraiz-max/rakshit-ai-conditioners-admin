import React, { useState } from 'react'
import { Mail, MessageSquare, Phone, Calendar, Clock, ChevronRight, User, Trash2, CheckCircle2 } from 'lucide-react'

const Messages = () => {
  const [activeTab, setActiveTab] = useState('inquiries') // 'inquiries' or 'contacts'

  const inquiries = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '+91 98765 00001', product: 'Daikin 1.5 Ton Inverter AC', message: 'Looking for installation in Indiranagar. Please provide best quote.', date: '2024-04-19', status: 'New' },
    { id: 2, name: 'Sita Ram', email: 'sita@yahoo.co.in', phone: '+91 88888 77777', product: 'Cassette AC 2.0 Ton', message: 'Need for my small office showroom.', date: '2024-04-18', status: 'Replied' },
  ]

  const contacts = [
    { id: 1, name: 'Anita Deshmukh', email: 'anita.d@gmail.com', subject: 'Partnership Inquiry', message: 'Interested in becoming a dealer for Rakshit Air Conditioners.', date: '2024-04-17', status: 'Unread' },
    { id: 2, name: 'Vikram Singh', email: 'vikram@outlook.com', subject: 'Service Complaint', message: 'AC not cooling properly after recent service.', date: '2024-04-16', status: 'Read' },
  ]

  const activeData = activeTab === 'inquiries' ? inquiries : contacts

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages & Inquiries</h1>
          <p className="text-sm text-slate-500 mt-1">Manage product enquiries and contact form submissions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('inquiries')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'inquiries' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Product Inquiries
        </button>
        <button 
          onClick={() => setActiveTab('contacts')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'contacts' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Contact Submissions
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {activeData.map((msg) => (
          <div key={msg.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-brand/30 hover:shadow-md transition-all overflow-hidden group">
            <div className="p-5 flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-slate-400" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{msg.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail className="w-3.5 h-3.5" /> {msg.email}
                      </div>
                      {msg.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="w-3.5 h-3.5" /> {msg.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${msg.status === 'New' || msg.status === 'Unread' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}
                    `}>
                      {msg.status}
                    </span>
                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {msg.date}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {activeTab === 'inquiries' && (
                    <p className="text-[10px] font-bold text-brand uppercase mb-2">Inquired about: {msg.product}</p>
                  )}
                  {activeTab === 'contacts' && (
                    <p className="text-[10px] font-bold text-brand uppercase mb-2">Subject: {msg.subject}</p>
                  )}
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    "{msg.message}"
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button className="text-xs font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1.5 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                  <button className="text-xs font-bold text-brand hover:text-brand-hover flex items-center gap-1.5 transition-colors px-4 py-2 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-3.5 h-3.5" /> Mark as Replied
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {activeData.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No {activeTab} found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
