from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import CreateUserForm
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout

def loginPage(request):

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('search')
        else:
            messages.info(request, 'Username OR Password Incorrect')


    context = {}
    return render(request, "user_auth/login.html", context)

def registerPage(request):
    form = CreateUserForm()

    if request.method == 'POST':
        form = CreateUserForm(request.POST)
        if form.is_valid():
            form.save()
            user = form.cleaned_data.get('username')
            messages.success(request, 'Account Created for ' + user)
            return redirect('login')

    context = {'form': form}
    return render(request, "user_auth/register.html", context)

def logoutUser(request):
    logout(request)
    return redirect('search')

@login_required
def profile(request):
    return render(request, 'user_auth/profile.html')