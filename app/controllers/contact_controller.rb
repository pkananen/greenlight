class ContactController < ApplicationController
  def new
    @contact = Contact.new
  end

  def create
    @contact = Contact.new(contact_params)

    if @contact.save
      ContactMailer.question(@contact).deliver
      redirect_to "/"
    else
      render "new"
    end
  end

  def contact_params
    params.require(:contact).permit(:name, :email, :question)
  end
end
