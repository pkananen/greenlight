class ContactMailer < ApplicationMailer
  default from: "hello@greenlight.com"

  def question(contact)
    @contact = contact

    mail to: "alex.tuley@gaslight.co"
  end
end
