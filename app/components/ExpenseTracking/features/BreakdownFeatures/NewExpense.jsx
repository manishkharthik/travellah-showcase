import React from 'react';
import { useState, useEffect } from 'react';
import { card, input } from '../OtherFeatures/uiStyles';

export default function NewExpense({ person, currentUser, onAdd, onEdit, onClose, isEditing = false, initialData = {}, tripId }) {
    {/* This component is used to add a new expense. It takes in the following props: */}
    const [formData, setFormData] = useState({
      name: initialData.name || '',
      cost: initialData.cost ?? initialData.totalCost ?? '',
      category: initialData.category || 'Individual',
      paidBy: initialData.paidBy === currentUser
        ? "You"
        : initialData.paidBy || '',
      status: initialData.status || 'Select status',
    });
  
    {/* Initialise with empty values */}
    useEffect(() => {
      if (!isEditing) {
        setFormData(f => ({ ...f,}));
      }
    }, [person, isEditing]);

    {/* This function handles the change event for the input fields */}
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };
    
    {/* This function handles the submit event for the form */}
    const handleSubmit = (e) => {
        e.preventDefault();
        const cost = parseFloat(formData.cost);
        const payer = formData.paidBy === "You" ? currentUser : person.name;
        const receiver = payer === currentUser ? person.name : currentUser;

        const expenseData = {
          name: formData.name,
          totalCost: cost,
          category: formData.category, // should always be 'Individual' here
          status: formData.status,
          tripId,
          paidBy: payer,
          peopleInvolved: [payer, receiver],
          owedBy: [receiver],
          transactions: [{ from: receiver, to: payer, amount: cost }],
        };

        if (isEditing) {
          onEdit({ ...expenseData, id: initialData.id });
        } else {
          onAdd(expenseData);
        }
        onClose();
    };

    {/* Form design and logic */}
    return (
        <form className={card} onSubmit={handleSubmit}>
          <input className={input} name="name" placeholder="Expenditure" value={formData.name} onChange={handleChange} required />
          <input className={input} name="cost" placeholder="Cost" type="number" value={formData.cost} onChange={handleChange} required />
          <select className={input} name="paidBy" value={formData.paidBy} onChange={handleChange} required>
            <option value="">Paid by</option>
            <option value="You">You</option>
            <option value={person.name}>{person.name}</option>
          </select>
          <select className={input} name="status" value={formData.status} onChange={handleChange} required>
            <option value="">Select status</option>
            <option value="Settled">Settled</option>
            <option value="Unsettled">Unsettled</option>
          </select>
          <div className="flex gap-4 justify-end">
            <button 
              type="submit" 
              className="px-6 py-3 rounded-md bg-emerald-500 text-white font-semibold text-lg border-none cursor-pointer transition-transform duration-100 hover:bg-emerald-600"
            >
              {isEditing ? 'Update' : 'Submit'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-md bg-red-400 text-white font-semibold text-lg border-none cursor-pointer transition-transform duration-100 hover:bg-red-500"
            >
              Cancel
            </button>
          </div>
        </form>
    );
}